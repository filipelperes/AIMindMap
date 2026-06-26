import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "../organisms/ParticleBackground";
import LazyGraphScene from "../organisms/LazyGraphScene";
import HeroOverlay from "../organisms/HeroOverlay";
import DetailPanel from "../organisms/DetailPanel";
import type { MindMapNode, GraphData } from "../../types/mindmap";

interface MainLayoutProps {
  data: GraphData;
  selectedNodeId: string | null;
  selectedNode: MindMapNode | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
  isMobile: boolean;
  isMobileSidebarOpen?: boolean;
}

/**
 * Template: main layout with animated 3D particle background.
 *
 * Layers (z-index):
 *  0 — ParticleBackground (main animated background)
 * 10 — GraphScene (3D molecules with transparent background)
 * 40 — HeroOverlay (title + subtitle)
 * 50 — DetailPanel
 */
const MainLayout: React.FC<MainLayoutProps> = React.memo(
  ({ data, selectedNodeId, selectedNode, onSelect, onClose, isMobile, isMobileSidebarOpen }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <div
        className="relative h-screen w-screen overflow-hidden"
        style={{
          paddingLeft: isMobile ? 0 : "16rem",
          opacity: mounted ? 1 : 0,
          transition: "opacity 1.2s ease-in-out",
        }}
      >
        {/* Layer 0: Animated particle background — MAIN background */}
        <div className="absolute inset-0 z-0">
          <ParticleBackground
            opacity={isMobile && isMobileSidebarOpen ? 0.3 : 1}
            dense
          />
        </div>

        {/* Layer 10: 3D graph with transparent background */}
        <motion.div
          data-tour="graph"
          animate={{
            scale: selectedNode ? 1.0 : 1,
            filter: selectedNode ? "brightness(1.05)" : "brightness(1)",
          }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-10"
          style={{ left: isMobile ? 0 : "16rem" }}
        >
          <LazyGraphScene
            data={data}
            selectedNodeId={selectedNodeId}
            onSelect={onSelect}
          />
        </motion.div>

        {/* Layer 40: Title (only when nothing is selected) */}
        {!selectedNode && <HeroOverlay isMobile={isMobile} />}

        {/* Layer 50: Detail panel (only when something is selected) */}
        <DetailPanel
          node={selectedNode}
          onClose={onClose}
          isMobile={isMobile}
        />
      </div>
    );
  },
);

MainLayout.displayName = "MainLayout";
export default MainLayout;
