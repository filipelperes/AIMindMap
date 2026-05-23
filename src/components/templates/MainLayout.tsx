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
 * Template: layout principal com fundo animado de partículas 3D.
 *
 * Camadas (z-index):
 *  0 — ParticleBackground (fundo animado principal)
 * 10 — GraphScene (moléculas 3D com fundo transparente)
 * 40 — HeroOverlay (título + subtítulo)
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
        {/* Camada 0: Fundo animado de partículas — fundo PRINCIPAL */}
        <div className="absolute inset-0 z-0">
          <ParticleBackground
            opacity={isMobile && isMobileSidebarOpen ? 0.3 : 1}
            dense
          />
        </div>

        {/* Camada 10: Grafo 3D com fundo transparente */}
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

        {/* Camada 40: Título (apenas quando sem seleção) */}
        {!selectedNode && <HeroOverlay isMobile={isMobile} />}

        {/* Camada 50: Painel de detalhes (apenas quando com seleção) */}
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
