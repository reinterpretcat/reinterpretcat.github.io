/* tslint:disable */
/* eslint-disable */
/**
* Runs 3D functions experiment.
* @param {string} function_name
* @param {string} population_type
* @param {number} x
* @param {number} z
* @param {number} generations
*/
export function run_function_experiment(function_name: string, population_type: string, x: number, z: number, generations: number): void;
/**
* Runs VRP experiment.
* @param {string} format_type
* @param {string} problem
* @param {string} population_type
* @param {number} generations
*/
export function run_vrp_experiment(format_type: string, problem: string, population_type: string, generations: number): void;
/**
* Loads experiment data from json serialized representation.
* @param {string} data
* @returns {number}
*/
export function load_state(data: string): number;
/**
* Clears experiment data.
*/
export function clear(): void;
/**
* Gets current (last) generation.
* @returns {number}
*/
export function get_generation(): number;
/**
* Type used on the JS side to convert screen coordinates to chart coordinates.
*/
export class Chart {
  free(): void;
/**
* Draws best known fitness progression for benchmark functions.
* @param {HTMLCanvasElement} canvas
*/
  static fitness_func(canvas: HTMLCanvasElement): void;
/**
* Draws best known fitness progression for vrp problem.
* @param {HTMLCanvasElement} canvas
*/
  static fitness_vrp(canvas: HTMLCanvasElement): void;
/**
* Draws plot for rosenbrock function.
* @param {HTMLCanvasElement} canvas
* @param {number} generation
* @param {number} pitch
* @param {number} yaw
*/
  static rosenbrock(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
/**
* Draws plot for rastrigin function.
* @param {HTMLCanvasElement} canvas
* @param {number} generation
* @param {number} pitch
* @param {number} yaw
*/
  static rastrigin(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
/**
* Draws plot for himmelblau function.
* @param {HTMLCanvasElement} canvas
* @param {number} generation
* @param {number} pitch
* @param {number} yaw
*/
  static himmelblau(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
/**
* Draws plot for ackley function.
* @param {HTMLCanvasElement} canvas
* @param {number} generation
* @param {number} pitch
* @param {number} yaw
*/
  static ackley(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
/**
* Draws plot for matyas function.
* @param {HTMLCanvasElement} canvas
* @param {number} generation
* @param {number} pitch
* @param {number} yaw
*/
  static matyas(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
/**
* Draws plot for VRP problem.
* @param {HTMLCanvasElement} canvas
* @param {number} generation
* @param {number} pitch
* @param {number} yaw
*/
  static vrp(canvas: HTMLCanvasElement, generation: number, pitch: number, yaw: number): void;
/**
* Draws plot for heuristic estimations.
* @param {HTMLCanvasElement} canvas
* @param {number} generation
* @param {string} kind
*/
  static heuristic_estimations(canvas: HTMLCanvasElement, generation: number, kind: string): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly chart_fitness_func: (a: number, b: number) => void;
  readonly chart_fitness_vrp: (a: number, b: number) => void;
  readonly chart_rosenbrock: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly chart_rastrigin: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly chart_himmelblau: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly chart_ackley: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly chart_matyas: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly chart_vrp: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly chart_heuristic_estimations: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly run_function_experiment: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly run_vrp_experiment: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly load_state: (a: number, b: number) => number;
  readonly clear: () => void;
  readonly get_generation: () => number;
  readonly __wbg_chart_free: (a: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
