import { FC, MouseEvent as ReactMouseEvent } from 'react';
import { SymmetricStrategyProps } from './CreateSymmetricStrategy';
import { prettifyNumber } from 'utils/helpers';
import BigNumber from 'bignumber.js';

interface Props extends SymmetricStrategyProps {
  marketPrice: number;
}

interface GetPointConfig {
  bottom: number;
  middle: number;
  top: number;
  min: number;
  max: number;
  buyMax: number;
  sellMin: number;
  marginalBuy: number;
  marginalSell: number;
}

const getBoundaries = (props: Props) => {
  const min = new BigNumber(props.order0.min || '0');
  const max = new BigNumber(props.order0.max || '0');
  const marketPrice = new BigNumber(props.marketPrice);
  const minMean = marketPrice.lt(min) ? marketPrice : min;
  const maxMean = marketPrice.gt(max) ? marketPrice : max;
  const mean = minMean.plus(maxMean).div(2);
  const padding = maxMean.minus(minMean).times(0.1);
  return {
    left: minMean.minus(padding),
    right: maxMean.plus(padding),
    meanLeft: minMean.plus(mean).div(2),
    meanRight: maxMean.plus(mean).div(2),
    mean,
  };
};

const getBuyPoint = (config: GetPointConfig) => {
  const { top, middle, bottom, min, sellMin, marginalBuy } = config;
  if (marginalBuy <= min) return;
  const max = Math.min(sellMin, marginalBuy);
  return [
    [min, top].join(','),
    [marginalBuy, top].join(','),
    [marginalBuy, middle].join(','),
    [max, middle].join(','),
    [max, bottom].join(','),
    [min, bottom].join(','),
  ].join(' ');
};

const getMarginalBuyPoint = (config: GetPointConfig) => {
  const { top, middle, bottom, buyMax, sellMin, marginalBuy } = config;
  if (marginalBuy >= buyMax) return;
  if (marginalBuy >= sellMin) {
    return [
      [marginalBuy, top],
      [buyMax, top].join(','),
      [buyMax, middle].join(','),
      [marginalBuy, middle].join(','),
    ].join(' ');
  } else {
    return [
      [marginalBuy, top],
      [buyMax, top].join(','),
      [buyMax, middle].join(','),
      [sellMin, middle].join(','),
      [sellMin, bottom].join(','),
      [marginalBuy, bottom].join(','),
    ].join(' ');
  }
};

const getSellPoint = (config: GetPointConfig) => {
  const { top, middle, bottom, max, buyMax, marginalSell } = config;
  if (marginalSell >= max) return;
  const min = Math.max(buyMax, marginalSell);
  return [
    [min, top].join(','),
    [max, top].join(','),
    [max, bottom].join(','),
    [marginalSell, bottom].join(','),
    [marginalSell, middle].join(','),
    [min, middle].join(','),
  ].join(' ');
};

const getMarginalSellPoint = (config: GetPointConfig) => {
  const { top, middle, bottom, buyMax, sellMin, marginalSell } = config;
  if (marginalSell <= sellMin) return;
  if (marginalSell <= buyMax) {
    return [
      [sellMin, bottom].join(','),
      [sellMin, middle].join(','),
      [marginalSell, middle].join(','),
      [marginalSell, bottom].join(','),
    ].join(' ');
  }
  return [
    [sellMin, bottom].join(','),
    [sellMin, middle].join(','),
    [buyMax, middle].join(','),
    [buyMax, top].join(','),
    [marginalSell, top].join(','),
    [marginalSell, bottom].join(','),
  ].join(' ');
};

export const CreateSymmerticStrategyGraph: FC<Props> = (props) => {
  const { marketPrice, quote, order0, spreadPPM } = props;
  const { left, right, mean, meanLeft, meanRight } = getBoundaries(props);

  const baseWidth = right.minus(left);
  const width = baseWidth.toNumber();
  const ratio = width / 400;
  const height = 250 * ratio;
  const fontSize = 11 * ratio;

  // Price line
  const bottom = height - 28 * ratio;
  const priceStep = right.minus(left).div(40);
  const priceStepHeight = bottom - 10 * ratio;
  const steps = new Array(Math.floor(width))
    .fill(null)
    .map((_, i) => left.plus(priceStep.times(i)).toString());

  const priceIndicator = {
    y: bottom + 10 * ratio,
    fontSize: fontSize,
    dominantBaseline: 'hanging',
    textAnchor: 'middle',
    fill: 'white',
    fillOpacity: 0.6,
  };

  const middle = bottom - 62 * ratio;
  const top = middle - 62 * ratio;

  // Market price
  const marketValue = `${prettifyNumber(marketPrice)} ${quote?.symbol}`;
  const fontRatio = 1 / 2;
  const padding = 4 * ratio;
  const rectWidth = marketValue.length * (fontSize * fontRatio) + 4 * padding;
  const rectLeft = marketPrice - rectWidth / 2;
  const rectTop = bottom - (172 + 16) * ratio;
  const marketIndicator = {
    line: {
      x1: marketPrice,
      x2: marketPrice,
      y1: bottom,
      y2: bottom - 172 * ratio,
    },
    rect: {
      x: rectLeft,
      y: rectTop,
      width: rectWidth,
      height: fontSize + padding,
      rx: 4 * ratio,
    },
    text: {
      x: rectLeft + padding,
      y: rectTop + fontSize,
      fontSize,
    },
  };

  // Polygons
  const min = Number(order0.min);
  const max = Number(order0.max);
  const spread = ((max - min) * spreadPPM) / 100;
  const buyMax = max - spread;
  const sellMin = min + spread;
  const marginalBuy = Math.min(marketPrice - spread / 2, buyMax);
  const marginalSell = Math.max(marketPrice + spread / 2, sellMin);
  const config = {
    top,
    middle,
    bottom,
    min,
    max,
    buyMax,
    sellMin,
    marginalBuy: Math.max(marginalBuy, min),
    marginalSell: Math.min(marginalSell, max),
  };
  const buyPoints = getBuyPoint(config);
  const marginalBuyPoints = getMarginalBuyPoint(config);
  const sellPoints = getSellPoint(config);
  const marginalSellPoints = getMarginalSellPoint(config);

  ///////////////
  // Draggable //
  ///////////////

  let draggedHandler: 'buy' | 'sell' | undefined;
  let initialPosition = 0;
  let minMaxDelta = (max - min) / ratio;

  const getDelta = (e: MouseEvent) => {
    return draggedHandler === 'buy'
      ? Math.min(e.clientX - initialPosition, minMaxDelta)
      : Math.max(e.clientX - initialPosition, -minMaxDelta);
  };

  const translateHandler = (translate: number) => {
    const g = document.getElementById(`${draggedHandler}-handler`);
    g?.style.setProperty('transform', `translateX(${translate * ratio}px)`);
  };

  const dragStart = (e: ReactMouseEvent, mode: 'buy' | 'sell') => {
    initialPosition ||= e.clientX;
    draggedHandler = mode;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
  };
  const drag = (e: MouseEvent) => {
    if (!draggedHandler) return;
    const delta = getDelta(e);
    translateHandler(delta);
  };
  const dragEnd = (e: MouseEvent) => {
    if (draggedHandler) {
      const delta = getDelta(e);
      if (draggedHandler === 'buy') {
        const min = Number(order0.min) + delta * ratio;
        order0.setMin(min.toString());
      } else {
        const max = Number(order0.max) + delta * ratio;
        order0.setMax(max.toString());
      }
      translateHandler(0);
      initialPosition = 0;
      draggedHandler = undefined;
    }
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
  };

  return (
    <svg
      className="aspect-[400/250] w-full rounded bg-black font-mono"
      viewBox={`${left} 0 ${width} ${height}`}
    >
      {/* Pattern */}
      <defs>
        <symbol
          id="carbonLogo"
          width={8 * ratio}
          height={8 * ratio}
          viewBox="0 0 672 886"
          fill="dark"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M236.253 0.40625H543.432L590.851 151.443L516.258 259.817L671.892 562.311L597.058 641.054L667.572 865.583H3.43463L31.0508 642.298L0.482422 563.705L34.4791 195.043H66.9848L73.1824 56.3078L236.253 0.40625ZM86.5195 195.043H130.749L109.676 572.069H24.6749L51.0225 639.81L25.5123 846.068H329.049L339.284 534.202L265.803 380.763L236.207 259.029H361.697L442.063 641.054H597.058L671.892 562.311H526.547L404.627 204.8H488.529L516.258 259.817L590.851 151.443H273.103L240.312 19.9215L92.085 70.458L86.5195 195.043Z"
            opacity="0.4"
          />
        </symbol>
        <pattern
          id="base-pattern"
          width={15 * ratio}
          height={25 * ratio}
          patternUnits="userSpaceOnUse"
        />
        <pattern href="#base-pattern" id="buy-pattern">
          <use href="#carbonLogo" x="0" y={4 * ratio} fill="#00B578" />
          <use href="#carbonLogo" x={8 * ratio} y={16 * ratio} fill="#00B578" />
          <rect
            x="0"
            y="0"
            width={15 * ratio}
            height={25 * ratio}
            fill="#00B578"
            fillOpacity="0.05"
          />
        </pattern>
        <pattern href="#base-pattern" id="sell-pattern">
          <use href="#carbonLogo" x="0" y={4 * ratio} fill="#D86371" />
          <use href="#carbonLogo" x={8 * ratio} y={16 * ratio} fill="#D86371" />
          <rect
            x="0"
            y="0"
            width={15 * ratio}
            height={25 * ratio}
            fill="#D86371"
            fillOpacity="0.05"
          />
        </pattern>
      </defs>

      {/* Buy */}
      <g>
        {buyPoints && (
          <polygon points={buyPoints} fill="#00B578" fillOpacity="0.35" />
        )}
        {marginalBuyPoints && (
          <polygon points={marginalBuyPoints} fill="url(#buy-pattern)" />
        )}
        <line
          x1={buyMax}
          x2={buyMax}
          y1={middle}
          y2={top}
          stroke="#00B578"
          strokeWidth={2 * ratio}
        />
      </g>

      {/* Sell */}
      <g>
        <line
          x1={sellMin}
          x2={sellMin}
          y1={bottom}
          y2={middle}
          stroke="#D86371"
          strokeWidth={2 * ratio}
        />
        {sellPoints && (
          <polygon points={sellPoints} fill="#D86371" fillOpacity="0.35" />
        )}
        {/* Sell marginal price */}
        {marginalSellPoints && (
          <polygon points={marginalSellPoints} fill="url(#sell-pattern)" />
        )}
      </g>
      {/* Price line */}
      <g>
        <line
          x1={left.toString()}
          x2={right.toString()}
          y1={bottom}
          y2={bottom}
          stroke="#212123"
          strokeWidth={ratio}
        />
        {steps.map((step) => (
          <line
            key={step}
            x1={step}
            x2={step}
            y1={bottom}
            y2={priceStepHeight}
            stroke="#212123"
            strokeWidth={ratio}
          />
        ))}
        <text x={meanLeft.toString()} {...priceIndicator}>
          {prettifyNumber(meanLeft)}
        </text>
        <text x={mean.toString()} {...priceIndicator}>
          {prettifyNumber(mean)}
        </text>
        <text x={meanRight.toString()} {...priceIndicator}>
          {prettifyNumber(meanRight)}
        </text>
      </g>
      {/* Market Price */}
      <g>
        <line {...marketIndicator.line} stroke="#404040" strokeWidth={ratio} />
        <rect {...marketIndicator.rect} fill="#404040" />
        <text {...marketIndicator.text} fill="white">
          {marketValue}
        </text>
      </g>

      {/* Handlers: must be at the end to always be above the graph */}
      <g
        id="buy-handler"
        className="cursor-ew-resize"
        onMouseDown={(e) => dragStart(e, 'buy')}
      >
        <rect
          x={min - 11 * ratio}
          y={top - 1 * ratio}
          width={12 * ratio}
          height={24 * ratio}
          fill="#00B578"
          rx={4 * ratio}
        />
        <line
          x1={min - 7 * ratio}
          x2={min - 7 * ratio}
          y1={top + 19 * ratio}
          y2={top + 4 * ratio}
          stroke="black"
          strokeOpacity="0.5"
          strokeWidth={ratio}
        />
        <line
          x1={min - 3 * ratio}
          x2={min - 3 * ratio}
          y1={top + 19 * ratio}
          y2={top + 4 * ratio}
          stroke="black"
          strokeOpacity="0.5"
          strokeWidth={ratio}
        />
        <line
          x1={min}
          x2={min}
          y1={bottom}
          y2={top + 20 * ratio}
          stroke="#00B578"
          strokeWidth={2 * ratio}
        />
      </g>
      <g
        id="sell-handler"
        className="cursor-ew-resize"
        onMouseDown={(e) => dragStart(e, 'sell')}
      >
        <rect
          x={max - 1 * ratio}
          y={top - 1 * ratio}
          width={12 * ratio}
          height={24 * ratio}
          fill="#D86371"
          rx={4 * ratio}
        />
        <line
          x1={max + 7 * ratio}
          x2={max + 7 * ratio}
          y1={top + 19 * ratio}
          y2={top + 4 * ratio}
          stroke="black"
          strokeOpacity="0.5"
          strokeWidth={ratio}
        />
        <line
          x1={max + 3 * ratio}
          x2={max + 3 * ratio}
          y1={top + 19 * ratio}
          y2={top + 4 * ratio}
          stroke="black"
          strokeOpacity="0.5"
          strokeWidth={ratio}
        />
        <line
          x1={max}
          x2={max}
          y1={bottom}
          y2={top + 20 * ratio}
          stroke="#D86371"
          strokeWidth={2 * ratio}
        />
      </g>
    </svg>
  );
};
