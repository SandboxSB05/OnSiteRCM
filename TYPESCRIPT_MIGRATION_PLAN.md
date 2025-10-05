# TypeScript Migration Plan for OnSite Roof Tracker

## Current State Assessment

### ✅ What's Already Set Up

- Vite already configured with TypeScript support (`.ts`, `.tsx` extensions in resolve)
- One TypeScript file exists: `src/utils/index.ts`
- Modern build tooling (Vite 6.3.6)
- React 18.2.0

### ❌ What's Missing

- No `tsconfig.json` configuration
- No TypeScript installed as dependency
- No type definitions for React/libraries
- All components are `.jsx` instead of `.tsx`
- No type definitions for API entities
- No type definitions for props/state

## Migration Strategy

### Option A: **Gradual Migration** (RECOMMENDED ⭐)

**Timeline:** 2-3 weeks
**Risk:** Low
**Effort:** Moderate

Migrate file by file, starting with:

1. Configuration & setup
2. Utilities and helpers
3. Type definitions (interfaces/types)
4. Services/API layer
5. Components (bottom-up: UI → features → pages)
6. Keep `.jsx` and `.tsx` working side-by-side

**Pros:**

- Safest approach
- Can test each file as you go
- Team can learn TypeScript gradually
- App stays functional throughout
- Can ship features during migration

**Cons:**

- Takes longer
- Mixed codebase temporarily
- Need to maintain both patterns

### Option B: **Big Bang Migration** (Aggressive ⚡)

**Timeline:** 3-5 days intensive work
**Risk:** High
**Effort:** High

Convert everything at once:

1. Set up TypeScript config
2. Rename all `.jsx` → `.tsx`, `.js` → `.ts`
3. Add types to all files
4. Fix all type errors
5. Test everything

**Pros:**

- Done quickly
- Consistent codebase
- Immediate benefits

**Cons:**

- Risky - app may break
- Hard to debug
- Team productivity halts
- Can't ship features during migration

### Option C: **New Code Only** (Minimal 🔧)

**Timeline:** Ongoing
**Risk:** Very Low
**Effort:** Low

- Keep existing JavaScript
- Write all NEW code in TypeScript
- Convert files only when touching them

**Pros:**

- Zero disruption
- Natural migration over time
- Learn TypeScript gradually

**Cons:**

- Never fully migrated
- Inconsistent codebase
- Loses some benefits

## Recommended Approach: **Gradual Migration (Option A)**

### Phase 1: Setup & Configuration (1-2 hours)

#### 1.1 Install TypeScript Dependencies

```bash
npm install -D typescript @types/react @types/react-dom @types/node
npm install -D @types/react-router-dom
```

#### 1.2 Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "allowJs": true,
    "checkJs": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### 1.3 Create `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.js"]
}
```

#### 1.4 Rename `vite.config.js` → `vite.config.ts`

### Phase 2: Create Type Definitions (2-3 hours)

#### 2.1 Create `src/types/` folder structure

```
src/types/
  index.ts
  entities.types.ts
  api.types.ts
  component.types.ts
  context.types.ts
```

#### 2.2 Define Entity Types (`entities.types.ts`)

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "client";
  company?: string;
  created_date?: string;
}

export interface Project {
  id: string;
  project_name: string;
  client_name: string;
  status: ProjectStatus;
  start_date: string;
  end_date?: string;
  total_cost?: number;
  total_paid?: number;
  percent_complete?: number;
  user_id: string;
  created_date: string;
}

export type ProjectStatus =
  | "planning"
  | "in-progress"
  | "completed"
  | "on-hold"
  | "cancelled";

export interface DailyUpdate {
  id: string;
  project_id: string;
  update_date: string;
  description: string;
  photos?: string[];
  videos?: string[];
  materials_used?: Material[];
  hours_worked?: number;
  user_id: string;
}

export interface ClientUpdate {
  id: string;
  project_id: string;
  update_date: string;
  description: string;
  time_cost_labor?: number;
  time_cost_notes?: string;
  additional_materials?: AdditionalMaterial[];
  total_cost_to_date?: number;
  total_paid?: number;
  total_due?: number;
  photos?: string[];
  videos?: string[];
}

// ... more types
```

#### 2.3 Define Component Prop Types

```typescript
// component.types.ts
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// ... more prop types
```

### Phase 3: Migrate Core Files (3-4 hours)

#### Priority Order:

1. ✅ `src/utils/index.ts` (already TS)
2. `src/lib/utils.js` → `utils.ts`
3. `src/constants/` → all to `.ts`
4. `src/api/entities.js` → `entities.ts`
5. `src/api/integrations.js` → `integrations.ts`

### Phase 4: Migrate Services (2-3 hours)

Convert service layer with proper types:

```typescript
// services/user.service.ts
import { User } from "@/types/entities.types";

export const UserService = {
  me: async (): Promise<User> => {
    // implementation
  },

  list: async (orderBy?: string, limit?: number): Promise<User[]> => {
    // implementation
  },

  get: async (id: string): Promise<User> => {
    // implementation
  },

  // ... more methods with types
};
```

### Phase 5: Migrate UI Components (4-6 hours)

Start with leaf components (no dependencies):

1. `src/components/ui/button.jsx` → `button.tsx`
2. `src/components/ui/card.jsx` → `card.tsx`
3. Work up the dependency tree

Example migration:

```tsx
// Before (button.jsx)
import React from "react";

export function Button({ children, onClick, variant = "default", ...props }) {
  return (
    <button onClick={onClick} className={cn(variants[variant])} {...props}>
      {children}
    </button>
  );
}

// After (button.tsx)
import React from "react";
import { ButtonProps } from "@/types/component.types";

export function Button({
  children,
  onClick,
  variant = "default",
  size = "default",
  className,
  disabled = false,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Phase 6: Migrate Feature Components (6-8 hours)

Convert feature-specific components:

1. `src/components/dashboard/` → `.tsx`
2. `src/components/projects/` → `.tsx`
3. `src/components/analytics/` → `.tsx`
4. etc.

### Phase 7: Migrate Pages (4-6 hours)

Convert page components last:

1. `src/pages/Login.jsx` → `Login.tsx`
2. `src/pages/Register.jsx` → `Register.tsx`
3. `src/pages/Dashboard.jsx` → `Dashboard.tsx`
4. etc.

### Phase 8: Create Contexts with Types (2-3 hours)

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types/entities.types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ... implementation with proper types
}
```

### Phase 9: Update Hooks (2-3 hours)

```typescript
// hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { AuthContextType } from "@/types/context.types";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
```

### Phase 10: Testing & Cleanup (3-4 hours)

1. Fix all TypeScript errors
2. Test all features
3. Remove any remaining `.jsx` files
4. Update imports
5. Run type checking: `tsc --noEmit`
6. Build and verify: `npm run build`

## File-by-File Migration Checklist

### Critical Files First

- [ ] `vite.config.js` → `vite.config.ts`
- [ ] `src/lib/utils.js` → `utils.ts`
- [ ] Create `src/types/entities.types.ts`
- [ ] Create `src/types/component.types.ts`
- [ ] `src/api/entities.js` → `entities.ts`
- [ ] `src/api/integrations.js` → `integrations.ts`

### UI Components (~30 files)

- [ ] `src/components/ui/button.jsx` → `button.tsx`
- [ ] `src/components/ui/card.jsx` → `card.tsx`
- [ ] `src/components/ui/dialog.jsx` → `dialog.tsx`
- [ ] ... (continue for all UI components)

### Feature Components (~40 files)

- [ ] All `src/components/analytics/*.jsx` → `.tsx`
- [ ] All `src/components/dashboard/*.jsx` → `.tsx`
- [ ] All `src/components/projects/*.jsx` → `.tsx`
- [ ] All `src/components/dailyupdates/*.jsx` → `.tsx`
- [ ] ... (continue for all features)

### Pages (~14 files)

- [ ] `src/pages/Home.jsx` → `Home.tsx`
- [ ] `src/pages/Login.jsx` → `Login.tsx`
- [ ] `src/pages/Register.jsx` → `Register.tsx`
- [ ] `src/pages/Dashboard.jsx` → `Dashboard.tsx`
- [ ] ... (continue for all pages)

## Benefits You'll Get

### 1. **Type Safety** ✅

- Catch errors at compile time
- No more `undefined` errors
- Autocomplete for object properties

### 2. **Better IDE Support** ✅

- IntelliSense/autocomplete
- Inline documentation
- Refactoring tools
- Go to definition

### 3. **Self-Documenting Code** ✅

- Types serve as documentation
- Clear function signatures
- Explicit return types

### 4. **Easier Refactoring** ✅

- Compiler catches breaking changes
- Safe renames across codebase
- Confident code changes

### 5. **Fewer Bugs** ✅

- Studies show 15% fewer bugs with TypeScript
- Catch typos immediately
- Prevent null/undefined errors

## Potential Challenges

### 1. **Learning Curve**

- **Solution:** Start with simple types, gradually add complexity
- **Resources:** TypeScript handbook, React TypeScript cheatsheet

### 2. **Initial Slowdown**

- **Solution:** Expect 20-30% slower development initially
- **Payoff:** Faster debugging, fewer runtime errors

### 3. **Third-Party Libraries**

- **Challenge:** Some libraries lack type definitions
- **Solution:** Use `@types/*` packages or create custom `.d.ts` files

### 4. **Legacy Code**

- **Challenge:** Hard to type poorly structured code
- **Solution:** Use `any` temporarily, improve gradually

## Time & Cost Estimate

### **Gradual Migration (Recommended)**

- **Developer Time:** 30-40 hours total
- **Timeline:** 2-3 weeks (parallel with normal work)
- **Cost:** Medium (spread over time)
- **Risk:** Low

### **Big Bang Migration**

- **Developer Time:** 20-25 hours intensive
- **Timeline:** 3-5 days (full focus)
- **Cost:** High (productivity halt)
- **Risk:** High

## Migration Scripts

I can provide automated scripts for:

1. Batch rename `.jsx` → `.tsx`
2. Add basic type annotations
3. Generate type definitions from existing code
4. Update imports

## Next Steps - What Should We Do?

### Option 1: **Start Gradual Migration** (RECOMMENDED)

I'll help you:

1. Set up TypeScript config
2. Create type definitions
3. Migrate 5-10 files as examples
4. Provide migration guide for rest

### Option 2: **Full Migration Sprint**

I'll help you:

1. Set up everything
2. Migrate all files
3. Fix all errors
4. Test thoroughly

### Option 3: **Just TypeScript Setup**

I'll help you:

1. Add TypeScript config
2. Set up type definitions
3. You migrate files as needed

### Option 4: **Hold Off**

- Keep current JavaScript
- Revisit TypeScript later
- Focus on features first

---

## My Recommendation 🎯

**Start with Option 1: Gradual Migration**

**Why?**

- Your app is currently working well
- You have 90+ component files
- Team can learn TypeScript gradually
- Less risky
- Can ship features during migration

**First Sprint (1 week):**

1. Set up TypeScript config ✅
2. Create all type definitions ✅
3. Migrate core utilities ✅
4. Migrate 10-15 components as examples ✅
5. Document migration pattern ✅

**Then:** Team migrates files as they touch them

---

**Which option would you like to proceed with?** Or would you like me to:

- A) Show example of what a migrated file looks like?
- B) Start gradual migration (setup + examples)?
- C) Do full migration now?
- D) Something else?
