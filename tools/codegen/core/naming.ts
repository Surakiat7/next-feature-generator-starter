import {
  camelCase,
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

/** Validate a raw identifier used for features/pages/components. */
export function assertValidName(name: string, label: string): void {
  if (!name || !/[a-zA-Z]/.test(name)) {
    throw new Error(`Invalid ${label} "${name}": must contain letters.`);
  }
  if (/[/\\]/.test(name)) {
    throw new Error(`Invalid ${label} "${name}": must not contain slashes.`);
  }
}
