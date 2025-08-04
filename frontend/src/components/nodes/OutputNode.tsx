import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { FileText } from "lucide-react";
import { useWorkflow } from "../../store/WorkflowStore";

const OutputNode: React.FC<NodeProps> = () => {
  const { executionResult } = useWorkflow();

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 min-w-[300px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center mb-3">
        <FileText className="w-5 h-5 text-purple-600 mr-2" />
        <div className="font-medium text-purple-900">AI Response</div>
      </div>

      <div className="space-y-3">
        {executionResult ? (
          <div className="bg-white border border-purple-200 rounded-md p-3">
            <div className="text-sm font-medium text-purple-900 mb-2">
              Generated Response:
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {executionResult}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-purple-200 rounded-md p-3">
            <div className="text-sm text-purple-700 text-center py-4">
              AI response will appear here after workflow execution
            </div>
          </div>
        )}

        <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
          This node displays the AI-generated response based on the input query
          and PDF context.
        </div>
      </div>
    </div>
  );
};

export default memo(OutputNode);
