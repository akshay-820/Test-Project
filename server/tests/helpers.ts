import { vi } from "vitest";
import type express from "express";

export function mockRequest(
    overrides: Partial<express.Request> = {},
): express.Request {
    return { params: {}, query: {}, body: {}, ...overrides } as express.Request;
}

export function mockResponse() {
    const res = {} as express.Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}
