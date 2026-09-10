import {
  camelCase,
  capitalCase,
  constantCase,
  kebabCase,
  pascalCase,
} from "change-case";

/** `User Profile` / `user_profile` / `userProfile` → `user-profile`. */
export function toKebab(name: string): string {
  return kebabCase(name);
}

/** `user-profile` → `UserProfile`. */
export function toPascal(name: string): string {
  return pascalCase(name);
}

/** `user-profile` → `userProfile`. */
export function toCamel(name: string): string {
  return camelCase(name);
}

/** `order-history` → `ORDER_HISTORY`. */
export function toConstant(name: string): string {
  return constantCase(name);
}

/** `order-history` → `Order History`. */
export function toTitle(name: string): string {
  return capitalCase(name);
}

/** Feature/page view component name, e.g. `login` → `LoginView`. */
export function viewComponentName(page: string): string {
  return `${toPascal(page)}View`;
}

/** View file name, e.g. `login` → `login-view.tsx`. */
export function viewFileName(page: string): string {
  return `${toKebab(page)}-view.tsx`;
}

/** Next.js page component name, e.g. `login` → `LoginPage`. */
export function pageComponentName(page: string): string {
  return `${toPascal(page)}Page`;
}

/** React component name from a raw name, e.g. `login-form` → `LoginForm`. */
export function componentName(name: string): string {
  return toPascal(name);
}

/** Component file name, e.g. `LoginForm` / `login form` → `login-form.tsx`. */
export function componentFileName(name: string): string {
  return `${toKebab(name)}.tsx`;
}

/** Generic feature sample content component name, e.g. `product` → `ProductContent`. */
export function contentComponentName(feature: string): string {
  return `${toPascal(feature)}Content`;
}

/** Generic feature sample content file name, e.g. `product` → `product-content.tsx`. */
export function contentFileName(feature: string): string {
  return `${toKebab(feature)}-content.tsx`;
}

/** Generic feature sample hook name, e.g. `product` → `useProductState`. */
export function stateHookName(feature: string): string {
  return `use${toPascal(feature)}State`;
}

/** Generic feature sample hook file name, e.g. `product` → `use-product-state.ts`. */
export function stateHookFileName(feature: string): string {
  return `use-${toKebab(feature)}-state.ts`;
}

/** Generic feature sample constants object name, e.g. `order-history` → `ORDER_HISTORY_META`. */
export function constantsObjectName(feature: string): string {
  return `${toConstant(feature)}_META`;
}

/** Generic feature sample constants file name, e.g. `product` → `product.constants.ts`. */
export function constantsFileName(feature: string): string {
  return `${toKebab(feature)}.constants.ts`;
}

/** Generic feature sample types file name, e.g. `product` → `product.types.ts`. */
export function typesFileName(feature: string): string {
  return `${toKebab(feature)}.types.ts`;
}

/** Generic feature sample props type name, e.g. `product` → `ProductContentProps`. */
export function contentPropsTypeName(feature: string): string {
  return `${toPascal(feature)}ContentProps`;
}

/** Validate a raw identifier used for features/pages/components. */
export function assertValidName(name: string, label: string): void {
  if (!name || !/[a-zA-Z]/.test(name)) {
    throw new Error(`Invalid ${label} "${name}": must contain letters.`);
  }
  if (/[/\\]/.test(name)) {
    throw new Error(`Invalid ${label} "${name}": must not contain slashes.`);
  }
}
