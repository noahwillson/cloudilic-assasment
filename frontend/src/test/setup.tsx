import React from "react";
import { vi } from "vitest";

vi.mock("reactflow", () => ({
  ReactFlow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow">{children}</div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="mini-map" />,
  Panel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="panel">{children}</div>
  ),
  useReactFlow: () => ({
    screenToFlowPosition: vi.fn(),
  }),
  useNodesState: () => [[], vi.fn()],
  useEdgesState: () => [[], vi.fn()],
  addEdge: vi.fn(),
  applyNodeChanges: vi.fn((_changes: unknown, nodes: unknown) => nodes),
  applyEdgeChanges: vi.fn((_changes: unknown, edges: unknown) => edges),
}));

vi.mock("zustand", () => ({
  create: vi.fn(() => ({
    getState: vi.fn(),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
}));
