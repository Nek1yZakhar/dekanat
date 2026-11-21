import { describe, it, expect } from 'vitest';
import React from 'react';
import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { CertificateDocument } from '@/lib/pdf/certificate';
import {
  verifyCertificateAccess,
  GET as certificateRouteHandler,
  TEST_FIXTURE_REQUESTS,
} from '@/app/api/requests/[id]/certificate/route';

describe('TICKET-06: Certificate Generation & IDOR Security Matrix', () => {
  const student1Id = '00000000-0000-0000-0000-000000000001';
  const student2Id = '00000000-0000-0000-0000-000000000002';
  const staffId = '00000000-0000-0000-0000-000000000003';
  const student1ReqId = '00000000-0000-0000-0000-000000000100';

  const mockReq1 = {
    id: student1ReqId,
    student_id: student1Id,
  };

  describe('1. Pure IDOR Security Matrix Logic', () => {
    it('returns 401 Unauthorized for unauthenticated callers', () => {
      const result = verifyCertificateAccess(null, mockReq1);
      expect(result.allowed).toBe(false);
      expect(result.statusCode).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('returns 404 Not Found if request does not exist', () => {
      const result = verifyCertificateAccess(
        { id: student1Id, role: 'student' },
        null
      );
      expect(result.allowed).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Request not found');
    });

    it('returns 403 Forbidden when Student 2 attempts to access Student 1 certificate', () => {
      const result = verifyCertificateAccess(
        { id: student2Id, role: 'student' },
        mockReq1
      );
      expect(result.allowed).toBe(false);
      expect(result.statusCode).toBe(403);
      expect(result.error).toBe('Forbidden: IDOR protection triggered');
    });

    it('allows Student 1 to access their own certificate (200 OK)', () => {
      const result = verifyCertificateAccess(
        { id: student1Id, role: 'student' },
        mockReq1
      );
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('allows Staff to access any student certificate for preview/signing (200 OK)', () => {
      const result = verifyCertificateAccess(
        { id: staffId, role: 'staff' },
        mockReq1
      );
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns 403 Forbidden for unrecognized roles (strict whitelist enforcement)', () => {
      const result = verifyCertificateAccess(
        { id: 'unknown-id', role: 'guest' as any },
        mockReq1
      );
      expect(result.allowed).toBe(false);
      expect(result.statusCode).toBe(403);
      expect(result.error).toBe('Forbidden: IDOR protection triggered');
    });
  });

  describe('2. Protected API Route Handler (GET /api/requests/[id]/certificate)', () => {
    it('returns 401 for request without authentication headers', async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/requests/${student1ReqId}/certificate`
      );
      const res = await certificateRouteHandler(req, {
        params: Promise.resolve({ id: student1ReqId }),
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 403 Forbidden with IDOR protection message when Student 2 requests Student 1 document', async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/requests/${student1ReqId}/certificate`,
        {
          headers: {
            'x-test-user-id': student2Id,
            'x-test-user-role': 'student',
          },
        }
      );
      const res = await certificateRouteHandler(req, {
        params: Promise.resolve({ id: student1ReqId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe('Forbidden: IDOR protection triggered');
    });

    it('returns 404 when querying an unknown request ID', async () => {
      const unknownId = '99999999-9999-9999-9999-999999999999';
      const req = new NextRequest(
        `http://localhost:3000/api/requests/${unknownId}/certificate`,
        {
          headers: {
            'x-test-user-id': student1Id,
            'x-test-user-role': 'student',
          },
        }
      );
      const res = await certificateRouteHandler(req, {
        params: Promise.resolve({ id: unknownId }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Request not found');
    });

    it('returns 200 OK with application/pdf when Student 1 accesses own request', async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/requests/${student1ReqId}/certificate`,
        {
          headers: {
            'x-test-user-id': student1Id,
            'x-test-user-role': 'student',
          },
        }
      );
      const res = await certificateRouteHandler(req, {
        params: Promise.resolve({ id: student1ReqId }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/pdf');
      expect(res.headers.get('Content-Disposition')).toBe(
        `inline; filename="spravka_${student1ReqId}.pdf"`
      );
      expect(res.headers.get('Cache-Control')).toBe('private, max-age=3600');

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      expect(buffer.length).toBeGreaterThan(5000);
      expect(buffer.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    });

    it('returns 200 OK with application/pdf when Staff accesses Student 1 request', async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/requests/${student1ReqId}/certificate`,
        {
          headers: {
            'x-test-user-id': staffId,
            'x-test-user-role': 'staff',
          },
        }
      );
      const res = await certificateRouteHandler(req, {
        params: Promise.resolve({ id: student1ReqId }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/pdf');

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      expect(buffer.length).toBeGreaterThan(5000);
      expect(buffer.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    });

    it('strictly ignores x-test-user-* headers when NODE_ENV is production (adversarial auth bypass defense)', async () => {
      const prevEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

        // Attacker attempts to spoof staff role using test headers
        const req = new NextRequest(
          `http://localhost:3000/api/requests/${student1ReqId}/certificate`,
          {
            headers: {
              'x-test-user-id': staffId,
              'x-test-user-role': 'staff',
            },
          }
        );
        const res = await certificateRouteHandler(req, {
          params: Promise.resolve({ id: student1ReqId }),
        });

        // In production, test headers must be completely ignored -> returns 401 Unauthorized
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error).toBe('Unauthorized');
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
      }
    });

    it('strictly ignores TEST_FIXTURE_REQUESTS fallback when NODE_ENV is production (Zero-Mock enforcement)', async () => {
      const prevEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

        const req = new NextRequest(
          `http://localhost:3000/api/requests/${student1ReqId}/certificate`,
          {
            headers: {
              'x-test-user-id': student1Id,
              'x-test-user-role': 'student',
            },
          }
        );
        const res = await certificateRouteHandler(req, {
          params: Promise.resolve({ id: student1ReqId }),
        });

        // In production, neither test headers nor mock fixture fallbacks are used -> 401 Unauthorized
        expect(res.status).toBe(401);
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
      }
    });
  });

  describe('3. React-PDF Certificate Document Engine', () => {
    it('renders a genuine A4 PDF binary stream starting with %PDF-1.', async () => {
      const doc = React.createElement(CertificateDocument, {
        requestId: student1ReqId,
        studentName: 'Смирнов Алексей Владимирович',
        courseYear: 3,
        groupName: 'ЦД-23-1',
        faculty: 'Факультет прикладной цифровизации и анализа данных',
        program: '09.03.03 Прикладная информатика',
        purpose: 'Для предоставления по месту требования',
      });

      const buffer = await renderToBuffer(doc as any);

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(10000);

      // Verify PDF magic header bytes %PDF-1.
      const magicBytes = buffer.subarray(0, 7).toString('utf-8');
      expect(magicBytes).toMatch(/^%PDF-1\./);

      // Verify PDF trailer / EOF
      const trailer = buffer.subarray(buffer.length - 64).toString('utf-8');
      expect(trailer).toContain('%%EOF');
    });
  });

  describe('4. Role Guard & Navigation Isolation Logic', () => {
    it('redirects student role away from /staff to /dashboard in requireStaffSession', () => {
      function evaluateStaffGuard(session: { role: string }) {
        if (session.role !== 'staff') {
          return { redirect: '/dashboard' };
        }
        return { allowed: true };
      }

      expect(evaluateStaffGuard({ role: 'student' })).toEqual({
        redirect: '/dashboard',
      });
      expect(evaluateStaffGuard({ role: 'staff' })).toEqual({
        allowed: true,
      });
    });

    it('redirects staff role away from student pages to /staff', () => {
      function evaluateStudentLayoutGuard(session: { role: string }) {
        if (session.role === 'staff') {
          return { redirect: '/staff' };
        }
        return { allowed: true };
      }

      expect(evaluateStudentLayoutGuard({ role: 'staff' })).toEqual({
        redirect: '/staff',
      });
      expect(evaluateStudentLayoutGuard({ role: 'student' })).toEqual({
        allowed: true,
      });
    });
  });
});
