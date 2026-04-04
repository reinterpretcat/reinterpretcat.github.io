/* tslint:disable */
/* eslint-disable */
/**
 * Gets current (last) generation.
 */
export function get_generation(): number;
/**
 * Loads experiment data from json serialized representation.
 */
export function load_state(data: string): number;
/**
 * Runs VRP experiment.
 */
export function run_vrp_experiment(format_type: string, problem: string, population_type: string, generations: number): void;
/**
 * Clears experiment data.
 */
export function clear(): void;
/**
 * Runs 3D functions experiment.
 */
export function run_function_experiment(function_name: string, population_type: string, x: number, z: number, generations: number): void;
/**
 * Type used on the JS side to convert screen coordinates to chart coordinates.
 */
export class Chart {
  private constructor();
  free(): void;
  /**
   * Draws plot for himmelblau function.
   */
  static himmelblau(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
  /**
   * Draws plot for rosenbrock function.
   */
  static rosenbrock(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
  /**
   * Draws best known fitness progression for vrp problem.
   */
  static fitness_vrp(canvas: HTMLCanvasElement): void;
  /**
   * Draws best known fitness progression for benchmark functions.
   */
  static fitness_func(canvas: HTMLCanvasElement): void;
  /**
   * Draws plot for search estimations.
   */
  static search_iteration(canvas: HTMLCanvasElement, generation: number, kind: string): void;
  /**
   * Draws plot for best statistics.
   */
  static search_best_statistics(canvas: HTMLCanvasElement, generation: number, kind: string): void;
  /**
   * Draws plot for overall statistics.
   */
  static search_overall_statistics(canvas: HTMLCanvasElement, generation: number, kind: string): void;
  /**
   * Draws plot for duration statistics.
   */
  static search_duration_statistics(canvas: HTMLCanvasElement, generation: number, kind: string): void;
  /**
   * Draws plot for VRP problem.
   */
  static vrp(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
  /**
   * Draws plot for ackley function.
   */
  static ackley(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
  /**
   * Draws plot for matyas function.
   */
  static matyas(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
  /**
   * Draws plot for rastrigin function.
   */
  static rastrigin(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_chart_free: (a: number, b: number) => void;
  readonly chart_ackley: (a: any, b: number, c: number, d: number) => [number, number];
  readonly chart_fitness_func: (a: any) => [number, number];
  readonly chart_fitness_vrp: (a: any) => [number, number];
  readonly chart_himmelblau: (a: any, b: number, c: number, d: number) => [number, number];
  readonly chart_matyas: (a: any, b: number, c: number, d: number) => [number, number];
  readonly chart_rastrigin: (a: any, b: number, c: number, d: number) => [number, number];
  readonly chart_rosenbrock: (a: any, b: number, c: number, d: number) => [number, number];
  readonly chart_search_best_statistics: (a: any, b: number, c: number, d: number) => [number, number];
  readonly chart_search_duration_statistics: (a: any, b: number, c: number, d: number) => [number, number];
  readonly chart_search_iteration: (a: any, b: number, c: number, d: number) => [number, number];
  readonly chart_search_overall_statistics: (a: any, b: number, c: number, d: number) => [number, number];
  readonly chart_vrp: (a: any, b: number, c: number, d: number) => [number, number];
  readonly load_state: (a: number, b: number) => number;
  readonly run_function_experiment: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly run_vrp_experiment: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly clear: () => void;
  readonly get_generation: () => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
