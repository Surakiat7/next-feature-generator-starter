import { componentName } from "../../core/naming";

/** A minimal but valid React component. */
export function componentFile(name: string): string {
  const comp = componentName(name);
  return `export function ${comp}() {
  return <div>${comp}</div>;
}
`;
}
