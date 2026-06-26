// ═══════════════════════════════════════════════════════════════
//  ⚠️  NO BARREL EXPORT — Import directly from sub-modules.
//
//  Barrel exports cause all sub-modules to be eagerly loaded,
//  including heavy components with side-effect registrations
//  (e.g., NodeContentRenderer + its 9 section renderers).
//
//  ✅ CORRECT:  import { Badge } from '../atoms'
//  ✅ CORRECT:  import { SidebarNav } from '../organisms'
//  ❌ WRONG:    import { Badge } from '..'  (pulls everything)
// ═══════════════════════════════════════════════════════════════
