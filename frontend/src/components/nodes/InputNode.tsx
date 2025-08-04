import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { MessageSquare } from "lucide-react";
import { useWorkflow } from "../../store/WorkflowStore";

const InputNode: React.FC<NodeProps> = ({ id, data }) => {
  const { updateNodeData } = useWorkflow();

  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateNodeData(id, { content: event.target.value });
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center mb-3">
        <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
        <div className="font-medium text-blue-900">Input</div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-blue-800">
          Question or Prompt
        </label>
        <textarea
          value={data.content || ""}
          onChange={handleContentChange}
          placeholder="Enter your question or prompt here..."
          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default memo(InputNode);
