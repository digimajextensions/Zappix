"use client";

import { useState, useCallback } from "react";

/**
 * Visual flow builder for chatbot automation flows.
 * Allows users to create multi-step conversation flows with
 * triggers, conditions, and actions.
 */

export interface FlowNode {
  id: string;
  type: "trigger" | "message" | "condition" | "action" | "delay";
  data: {
    label: string;
    content?: string;
    options?: string[];
    delaySeconds?: number;
    conditionField?: string;
    conditionValue?: string;
  };
  position: { x: number; y: number };
  connections: string[]; // IDs of connected nodes
}

export interface FlowData {
  nodes: FlowNode[];
  name: string;
  welcomeMessage?: string;
}

const NODE_COLORS = {
  trigger: "bg-blue-100 border-blue-400 text-blue-800",
  message: "bg-green-100 border-green-400 text-green-800",
  condition: "bg-yellow-100 border-yellow-400 text-yellow-800",
  action: "bg-purple-100 border-purple-400 text-purple-800",
  delay: "bg-gray-100 border-gray-400 text-gray-800",
};

const NODE_LABELS = {
  trigger: "Trigger",
  message: "Send Message",
  condition: "Condition",
  action: "Action",
  delay: "Delay",
};

function generateId() {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface FlowBuilderProps {
  initialData?: FlowData;
  onSave?: (data: FlowData) => void;
  readOnly?: boolean;
}

export function FlowBuilder({ initialData, onSave, readOnly = false }: FlowBuilderProps) {
  const [nodes, setNodes] = useState<FlowNode[]>(
    initialData?.nodes ?? [
      {
        id: "trigger_1",
        type: "trigger",
        data: { label: "When message received", content: "" },
        position: { x: 250, y: 50 },
        connections: [],
      },
    ]
  );
  const [flowName, setFlowName] = useState(initialData?.name ?? "New Flow");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const addNode = useCallback(
    (type: FlowNode["type"]) => {
      const newNode: FlowNode = {
        id: generateId(),
        type,
        data: { label: NODE_LABELS[type], content: "" },
        position: {
          x: 250,
          y: (nodes.length + 1) * 120 + 50,
        },
        connections: [],
      };
      setNodes((prev) => [...prev, newNode]);
    },
    [nodes.length]
  );

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<FlowNode["data"]>) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        )
      );
    },
    []
  );

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((prev) => {
      const updated = prev.filter((n) => n.id !== nodeId);
      // Remove connections pointing to this node
      return updated.map((n) => ({
        ...n,
        connections: n.connections.filter((c) => c !== nodeId),
      }));
    });
    setSelectedNode(null);
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (connecting) {
        // Complete the connection
        setNodes((prev) =>
          prev.map((n) =>
            n.id === connecting && !n.connections.includes(nodeId) && n.id !== nodeId
              ? { ...n, connections: [...n.connections, nodeId] }
              : n
          )
        );
        setConnecting(null);
      } else {
        setSelectedNode(nodeId === selectedNode ? null : nodeId);
      }
    },
    [connecting, selectedNode]
  );

  const startConnecting = useCallback((nodeId: string) => {
    setConnecting(nodeId);
  }, []);

  const handleSave = useCallback(() => {
    onSave?.({
      nodes,
      name: flowName,
      welcomeMessage: nodes.find((n) => n.type === "trigger")?.data.content,
    });
  }, [nodes, flowName, onSave]);

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Canvas */}
      <div className="flex-1 rounded-xl border border-gray-200 bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-3">
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="mr-auto rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium"
            placeholder="Flow name"
            disabled={readOnly}
          />
          {!readOnly && (
            <>
              <button
                onClick={() => addNode("message")}
                className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200"
              >
                + Message
              </button>
              <button
                onClick={() => addNode("condition")}
                className="rounded-lg bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-200"
              >
                + Condition
              </button>
              <button
                onClick={() => addNode("action")}
                className="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200"
              >
                + Action
              </button>
              <button
                onClick={() => addNode("delay")}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                + Delay
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700"
              >
                Save Flow
              </button>
            </>
          )}
        </div>

        {/* Flow Canvas */}
        <div className="relative min-h-[400px] overflow-auto p-4 sm:min-h-[500px]">
          {connecting && (
            <div className="absolute left-0 right-0 top-0 z-10 bg-blue-50 px-4 py-2 text-center text-sm text-blue-700">
              Click a node to connect to it, or click anywhere to cancel.
              <button
                onClick={() => setConnecting(null)}
                className="ml-2 underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Connection Lines (SVG) */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {nodes.map((node) =>
              node.connections.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId);
                if (!target) return null;

                const startX = node.position.x + 100;
                const startY = node.position.y + 30;
                const endX = target.position.x + 100;
                const endY = target.position.y;

                return (
                  <g key={`${node.id}-${targetId}`}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#16A34A"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                  </g>
                );
              })
            )}
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#16A34A" />
              </marker>
            </defs>
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute cursor-pointer rounded-lg border-2 px-4 py-3 shadow-sm transition-shadow hover:shadow-md ${
                NODE_COLORS[node.type]
              } ${selectedNode === node.id ? "ring-2 ring-green-500" : ""} ${
                connecting ? "ring-1 ring-blue-300" : ""
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                minWidth: "200px",
              }}
              onClick={() => handleNodeClick(node.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase opacity-60">
                  {node.type}
                </span>
                {!readOnly && node.type !== "trigger" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                    className="text-xs opacity-40 hover:opacity-100"
                  >
                    x
                  </button>
                )}
              </div>
              <div className="mt-1 text-sm font-medium">{node.data.label}</div>
              {node.data.content && (
                <div className="mt-1 truncate text-xs opacity-70">
                  {node.data.content}
                </div>
              )}
              {!readOnly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startConnecting(node.id);
                  }}
                  className="mt-2 text-xs underline opacity-50 hover:opacity-100"
                >
                  Connect
                </button>
              )}
            </div>
          ))}

          {nodes.length <= 1 && (
            <div className="flex h-full items-center justify-center pt-32 text-center text-sm text-gray-400">
              Add nodes from the toolbar above to build your flow.
            </div>
          )}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNodeData && !readOnly && (
        <div className="w-full rounded-xl border border-gray-200 bg-white p-4 lg:w-72">
          <h3 className="mb-4 text-sm font-bold">Node Properties</h3>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Label
              </label>
              <input
                type="text"
                value={selectedNodeData.data.label}
                onChange={(e) =>
                  updateNodeData(selectedNodeData.id, {
                    label: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
              />
            </div>

            {(selectedNodeData.type === "message" ||
              selectedNodeData.type === "trigger") && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  {selectedNodeData.type === "trigger"
                    ? "Trigger Keyword"
                    : "Message Content"}
                </label>
                <textarea
                  value={selectedNodeData.data.content ?? ""}
                  onChange={(e) =>
                    updateNodeData(selectedNodeData.id, {
                      content: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                />
              </div>
            )}

            {selectedNodeData.type === "condition" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Check Field
                  </label>
                  <input
                    type="text"
                    value={selectedNodeData.data.conditionField ?? ""}
                    onChange={(e) =>
                      updateNodeData(selectedNodeData.id, {
                        conditionField: e.target.value,
                      })
                    }
                    placeholder="e.g. message_text"
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Contains Value
                  </label>
                  <input
                    type="text"
                    value={selectedNodeData.data.conditionValue ?? ""}
                    onChange={(e) =>
                      updateNodeData(selectedNodeData.id, {
                        conditionValue: e.target.value,
                      })
                    }
                    placeholder="e.g. pricing"
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                  />
                </div>
              </>
            )}

            {selectedNodeData.type === "delay" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Delay (seconds)
                </label>
                <input
                  type="number"
                  min={1}
                  max={86400}
                  value={selectedNodeData.data.delaySeconds ?? 5}
                  onChange={(e) =>
                    updateNodeData(selectedNodeData.id, {
                      delaySeconds: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                />
              </div>
            )}

            <div className="pt-2">
              <p className="text-xs text-gray-400">
                Connections: {selectedNodeData.connections.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
