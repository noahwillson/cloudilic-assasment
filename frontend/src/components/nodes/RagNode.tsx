import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Database, FileText } from "lucide-react";
import { useWorkflow } from "../../store/WorkflowStore";

const RagNode: React.FC<NodeProps> = ({ id, data }) => {
  const { updateNodeData, pdfs } = useWorkflow();

  const handlePdfChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { pdfId: event.target.value });
  };

  const selectedPdf = pdfs.find((pdf) => pdf.id === data.pdfId);

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 min-w-[250px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center mb-3">
        <Database className="w-5 h-5 text-green-600 mr-2" />
        <div className="font-medium text-green-900">RAG Processing</div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-green-800 mb-1">
            Select PDF Document
          </label>
          <select
            value={data.pdfId || ""}
            onChange={handlePdfChange}
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Choose a PDF...</option>
            {pdfs.map((pdf) => (
              <option key={pdf.id} value={pdf.id}>
                {pdf.originalName}
              </option>
            ))}
          </select>
        </div>

        {selectedPdf && (
          <div className="bg-white border border-green-200 rounded-md p-3">
            <div className="flex items-center mb-2">
              <FileText className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-900">
                {selectedPdf.originalName}
              </span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <div>Pages: {selectedPdf.metadata.pages}</div>
              <div>Size: {(selectedPdf.size / 1024 / 1024).toFixed(2)} MB</div>
              <div className="flex items-center">
                Status:
                {selectedPdf.isIndexed ? (
                  <span className="ml-1 text-green-600 font-medium">
                    Indexed
                  </span>
                ) : (
                  <span className="ml-1 text-yellow-600 font-medium">
                    Not Indexed
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
          This node will extract content from the PDF and use semantic search to
          find relevant information for AI processing.
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default memo(RagNode);
