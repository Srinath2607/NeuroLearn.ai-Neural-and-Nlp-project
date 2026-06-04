"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Handle,
  Position,
  NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Brain, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Custom Node Component
const ConceptNode = ({ data }: NodeProps) => {
  const mastery = data.mastery as number;
  
  // Determine color based on mastery
  let ringColor = 'border-red-500';
  let bgColor = 'bg-red-500/10';
  let textColor = 'text-red-500';
  
  if (mastery >= 80) {
    ringColor = 'border-green-500';
    bgColor = 'bg-green-500/10';
    textColor = 'text-green-500';
  } else if (mastery >= 50) {
    ringColor = 'border-yellow-500';
    bgColor = 'bg-yellow-500/10';
    textColor = 'text-yellow-500';
  }

  return (
    <div className={`px-4 py-2 shadow-lg rounded-xl bg-card border-2 ${ringColor} min-w-[150px] text-center relative group`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-muted-foreground" />
      <div className="font-bold text-sm">{data.label as string}</div>
      <div className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block ${bgColor} ${textColor}`}>
        {mastery}% Mastery
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-muted-foreground" />
      
      {/* Hover tooltip for quick action */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex items-center gap-2 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-xs font-medium shadow-xl border border-border whitespace-nowrap z-50">
        Click for details
      </div>
    </div>
  );
};

export default function KnowledgeGraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Register custom node types
  const nodeTypes = useMemo(() => ({ conceptNode: ConceptNode }), []);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/api/graph", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch (err) {
        console.error("Failed to fetch graph", err);
      }
    };
    fetchGraph();
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback((event: any, node: any) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Main Graph Area */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden relative shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Your Knowledge Graph</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Mastered</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Learning</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> Needs Review</div>
          </div>
        </div>

        <div className="flex-1 mt-14">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background/50"
          >
            <Controls className="bg-card border-border fill-foreground" />
            <MiniMap 
              nodeColor={(n: any) => {
                const m = n.data?.mastery || 0;
                if (m >= 80) return '#22c55e';
                if (m >= 50) return '#eab308';
                return '#ef4444';
              }}
              maskColor="var(--background)"
              className="bg-card border-border"
            />
            <Background gap={16} size={1} color="var(--muted-foreground)" />
          </ReactFlow>
        </div>
      </div>

      {/* Side Panel for Node Details */}
      {selectedNode && (
        <div className="w-80 bg-card border border-border rounded-2xl p-6 flex flex-col shadow-sm overflow-y-auto hidden lg:flex">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl">{selectedNode.data.label}</h3>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              &times;
            </button>
          </div>

          <div className="space-y-6">
            {/* Mastery Stats */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Mastery</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-extrabold">{selectedNode.data.mastery}%</span>
                <span className="text-sm text-muted-foreground mb-1">/ 100%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full ${
                    selectedNode.data.mastery >= 80 ? 'bg-green-500' :
                    selectedNode.data.mastery >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${selectedNode.data.mastery}%` }}
                />
              </div>
            </div>

            {/* AI Diagnosis */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">AI Diagnosis</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedNode.data.mastery >= 80 
                  ? "You have a solid understanding of this concept. Excellent work!"
                  : selectedNode.data.mastery >= 50
                  ? "You understand the basics, but struggle with advanced application. Let's do some practice problems."
                  : "This seems to be a bottleneck. Your Curriculum Agent recommends an interactive visual review session."}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Link 
                href="/chat" 
                className="w-full flex items-center justify-between bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  <span>Study Now</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
              
              <Link 
                href="/quizzes" 
                className="w-full flex items-center justify-between bg-secondary text-secondary-foreground px-4 py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Take a Quiz</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
