import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  type Node,
} from "reactflow";

import "reactflow/dist/style.css";

import Editor from "@monaco-editor/react";
import traverse, { type NodePath, type Visitor } from "@babel/traverse";

import { parse } from "./transformation";

export const App = () => {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const hadleParse = () => {
    const result = parse(codeValue);

    // convert that result to a tree that React flow can use for sub layout

    const newNodes: Node[] = [];
    const newEdges = [];

    const rootId = "root";

    // store nodes by ID for ref later
    const nodeMap = new Map<string, Node>();

    const visitor: Visitor = {
      enter(path: NodePath) {
        const node = path.node;

        const id = path.node.start + "-" + path.node.end;

        console.log(node, path, id);

        // use the node loc line to set the y position

        const newNode = {
          id,
          data: { label: node.type },
          position: {
            x: node.loc?.start.column * 10,
            y: node.loc?.start.line * 50,
          },
          className: "light",
          style: {
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            width: 200,
            height: 200,
          },
        };

        newNodes.push(newNode);

        nodeMap.set(id, newNode);

        if (path.parentPath) {
          const parentId =
            path.parentPath?.node.start + "-" + path.parentPath?.node.end;

          // get the parent and set the extent
          const parent = nodeMap.get(parentId);
          if (parent) {
            parent.type = "group";
          }

          newNode.parentNode = parentId;

          newEdges.push({
            id: parentId + "-" + id,
            source: parentId,
            target: id,
          });
        }
      },
    };

    traverse(result, visitor);

    setNodes(newNodes);
    setEdges(newEdges);

    console.log("new nodes", newNodes);

    console.log(result);
  };

  const [codeValue, setCodeValue] = useState<string>("");

  return (
    <div className="min-h-[100vh] h-1 flex flex-col">
      <h2>TS AST Viewer</h2>

      <div className="flex-1 h-1">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col">
              <Editor
                className="flex-1"
                defaultLanguage="typescript"
                value={codeValue}
                onChange={(value) => setCodeValue(value ?? "")}
              />
              <button onClick={hadleParse}>Parse</button>
            </div>
          </Panel>
          <PanelResizeHandle className="w-2 bg-blue-800" />
          <Panel minSize={30}>
            <NestedFlow nodes={nodes} edges={edges} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Node 0" },
    position: { x: 250, y: 5 },
    className: "light",
  },
  {
    id: "2",
    data: { label: "Group A" },
    position: { x: 100, y: 100 },
    className: "light",
    style: { backgroundColor: "rgba(255, 0, 0, 0.2)", width: 200, height: 200 },
  },
  {
    id: "2a",
    data: { label: "Node A.1" },
    position: { x: 10, y: 50 },
    parentNode: "2",
  },
  {
    id: "3",
    data: { label: "Node 1" },
    position: { x: 320, y: 100 },
    className: "light",
  },
  {
    id: "4",
    data: { label: "Group B" },
    position: { x: 320, y: 200 },
    className: "light",
    style: { backgroundColor: "rgba(255, 0, 0, 0.2)", width: 300, height: 300 },
    type: "group",
  },
  {
    id: "4a",
    data: { label: "Node B.1" },
    position: { x: 15, y: 65 },
    className: "light",
    parentNode: "4",
    extent: "parent",
  },
  {
    id: "4b",
    data: { label: "Group B.A" },
    position: { x: 15, y: 120 },
    className: "light",
    style: {
      backgroundColor: "rgba(255, 0, 255, 0.2)",
      height: 150,
      width: 270,
    },
    parentNode: "4",
  },
  {
    id: "4b1",
    data: { label: "Node B.A.1" },
    position: { x: 20, y: 40 },
    className: "light",
    parentNode: "4b",
  },
  {
    id: "4b2",
    data: { label: "Node B.A.2" },
    position: { x: 100, y: 100 },
    className: "light",
    parentNode: "4b",
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e2a-4a", source: "2a", target: "4a" },
  { id: "e3-4b", source: "3", target: "4b" },
  { id: "e4a-4b1", source: "4a", target: "4b1" },
  { id: "e4a-4b2", source: "4a", target: "4b2" },
  { id: "e4b1-4b2", source: "4b1", target: "4b2" },
];

const NestedFlow = ({ nodes, edges }: { nodes?: Node[]; edges?: any[] }) => {
  const [lnodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [ledges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (nodes) {
      setNodes(nodes);
    }
  }, [nodes, setNodes]);

  useEffect(() => {
    if (edges) {
      setEdges(edges);
    }
  }, [edges, setEdges]);

  return (
    <ReactFlow
      nodes={lnodes}
      edges={ledges}
      fitView
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};
