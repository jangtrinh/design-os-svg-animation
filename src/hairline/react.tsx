import {
  forwardRef, useCallback, useEffect, useLayoutEffect, useRef,
  type ComponentPropsWithoutRef, type ForwardRefExoticComponent, type RefAttributes,
} from "react";
import { basket, branches, cabinet, dish, drawer, elevator, exploded, keyboard, laptop, lockers, loupe, padlock, patch, phone, phosphor, plot, plug, query, rail, riffle, router, sieve, slow, terminal, terrain, turntable, vault, type Figure, type HairlineOptions } from "./index";

/**
 * @lucasmarkes/hairline/react — the twenty-seven figures as components.
 *
 * A component renders one empty `<div>` and mounts the figure on it in a
 * layout effect, so on the server the box is there and the drawing is not.
 * It mounts once: a changed option reaches the running figure as `update`,
 * and `onRead` is called through a ref, so an inline function never remounts.
 */

/** The figure's options, plus every `<div>` attribute except `children`. */
export type HairlineProps = HairlineOptions & Omit<ComponentPropsWithoutRef<"div">, "children" | keyof HairlineOptions>;
type HairlineComponent = ForwardRefExoticComponent<HairlineProps & RefAttributes<HTMLDivElement>>;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function make(name: string, mount: (el: HTMLElement, options?: HairlineOptions) => Figure): HairlineComponent {
  const Component = forwardRef<HTMLDivElement, HairlineProps>(function Hairline(props, ref) {
    const { intensity, theme, label, onRead, style, ...attrs } = props;
    /* aria-label stays on the div and is the figure's label too, so the two never disagree about the name */
    const named = label ?? props["aria-label"];

    const el = useRef<HTMLDivElement | null>(null);
    const figure = useRef<Figure | null>(null);
    const read = useRef(onRead);
    const set = useCallback((node: HTMLDivElement | null) => {
      el.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }, [ref]);

    useIsoLayoutEffect(() => { read.current = onRead; });

    useIsoLayoutEffect(() => {
      const f = mount(el.current!, { intensity, theme, label: named, onRead: (text) => read.current?.(text) });
      figure.current = f;
      return () => { f.destroy(); figure.current = null; };
      // mounts once; options reach the figure through the effect below
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* every key is sent, so a prop that was removed goes back to its default */
    useIsoLayoutEffect(() => { figure.current?.update({ intensity, theme, label: named }); }, [intensity, theme, named]);

    return <div {...attrs} ref={set} style={{ aspectRatio: "5 / 4", ...style }} />;
  });
  Component.displayName = name;
  return Component;
}

/** A tray of eight cards. The card under the pointer stands up; the arrow keys walk the cards. `intensity` spreads the ripple further from the pulled card. */
export const Riffle = make("Riffle", riffle);
/** Eighty-one pillars on a plinth that rise around the pointer. `intensity` widens the area that rises. */
export const Terrain = make("Terrain", terrain);
/** An app window in four layers. Moving across opens the gap; moving down picks a layer. `intensity` opens the layers further. */
export const Exploded = make("Exploded", exploded);
/** A seven by seven dot matrix that plays a loop, and fades like phosphor where the pointer paints it. `intensity` makes the trail linger longer. */
export const Phosphor = make("Phosphor", phosphor);
/** Crates riding a belt through a gate. Hovering slows the clock without stopping it. `intensity` slows it more. */
export const Slow = make("Slow", slow);
/** Blocks on a turntable. A flick across it spins it; it settles on the nearest quarter turn. `intensity` makes the spin coast longer. */
export const Turntable = make("Turntable", turntable);
/** A sixty-key board. The key under the pointer sinks, and its neighbours follow it down, less the further away. `intensity` widens how far the press reaches. */
export const Keyboard = make("Keyboard", keyboard);
/** Four floors beside an open shaft. The pointer's height picks a floor, and the car travels there through the ones between. `intensity` makes the car travel faster. */
export const Elevator = make("Elevator", elevator);
/** A phone in layers: glass, board, battery, shell. Moving across opens the gap; moving down picks a layer. `intensity` opens the layers further. */
export const Phone = make("Phone", phone);
/** A thin laptop: the pointer's height sets how far the lid stands open, and the lid follows it on a spring. `intensity` lets the lid open wider. */
export const Laptop = make("Laptop", laptop);
/** A terminal window: the pointer's height scrolls back through its history, and the line under it lifts off the screen. `intensity` spreads the lift over more lines. */
export const Terminal = make("Terminal", terminal);
/** A rack of twelve blades: the pointer's height pulls the nearest ones out on their rails, the farther the less. `intensity` pulls out more blades. */
export const Cabinet = make("Cabinet", cabinet);
/** A commit graph on a board: the commit under the pointer rises, and its history rises after it, the farther back the less. `intensity` raises more of the history. */
export const Branches = make("Branches", branches);
/** A vault door: circling the pointer turns its dial, which coasts and catches every ten; on forty its three bolts draw back. `intensity` lets the dial coast longer. */
export const Vault = make("Vault", vault);
/** A bank of twelve lockers, one ajar at rest: the locker under the pointer opens, and the one open before it swings shut. `intensity` opens the door wider. */
export const Lockers = make("Lockers", lockers);
/** A stand loupe over a blank ruled sheet: the pointer drags it across, and the rules pass enlarged under the glass with nothing between them. `intensity` magnifies more. */
export const Loupe = make("Loupe", loupe);
/** A padlock: as the pointer nears, the shackle springs up out of the body and swings open about its long leg. `intensity` swings the shackle further. */
export const Padlock = make("Padlock", padlock);
/** A patch panel of twenty-four ports: the cable under the pointer lifts, and its neighbours lean away, less the further away. `intensity` spreads the lean over more ports. */
export const Patch = make("Patch", patch);
/** A parabolic dish on a two-axis gimbal: the pointer aims it, and it follows on a spring. `intensity` swings the dish further. */
export const Dish = make("Dish", dish);
/** A wifi router whose antennas lean toward the pointer, the nearest the most and the others less the further away. `intensity` spreads the lean over more antennas. */
export const Router = make("Router", router);
/** Three test sieves stacked over a pan: the pointer's height picks one, it rises clear of the stack, and every mesh is bare. `intensity` opens the gap further. */
export const Sieve = make("Sieve", sieve);
/** A garment rail with seven bare hangers: the pointer brushes them, and each rocks away from it, the nearest most, and settles. `intensity` reaches more hangers. */
export const Rail = make("Rail", rail);
/** A wall socket and a plug lying on the floor at the end of its cord: the pointer draws the plug up toward the socket, and it stops short. `intensity` brings it nearer. */
export const Plug = make("Plug", plug);
/** A question mark built as a solid on a plinth, its dot a loose ball: the hook turns about its stem toward the pointer, and the ball rolls after it. `intensity` turns the hook further. */
export const Query = make("Query", query);
/** A filing cabinet of three drawers: the pointer's height picks one, it slides out, and inside are two dividers and nothing between them. `intensity` pulls the drawer further out. */
export const Drawer = make("Drawer", drawer);
/** An empty wire shopping basket under a bail handle: the pointer tilts it toward itself on a spring, so the bare floor shows, and the handle swings after it, late. `intensity` tilts it further. */
export const Basket = make("Basket", basket);
/** A bar chart with no data: seven flat tabs on its base, before a plate of grid lines. The pointer brushes them, and each lifts a little, the nearest most, and drops back to zero. `intensity` lifts them higher. */
export const Plot = make("Plot", plot);
