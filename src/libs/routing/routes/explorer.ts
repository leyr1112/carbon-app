import { Route, redirect } from '@tanstack/react-router';
import { ExplorerType } from 'components/explorer/utils';
import { rootRoute } from 'libs/routing/routes/root';
import { ExplorerPage } from 'pages/explorer';
import { ExplorerTypePage } from 'pages/explorer/type';
import { ExplorerTypeOverviewPage } from 'pages/explorer/type/overview';
import { ExplorerTypePortfolioPage } from 'pages/explorer/type/portfolio';
import { ExplorerTypePortfolioTokenPage } from 'pages/explorer/type/portfolio/token';

export const explorerLayout = new Route({
  getParentRoute: () => rootRoute,
  path: '/explorer',
});

export const explorerRedirect = new Route({
  getParentRoute: () => explorerLayout,
  path: '/',
  beforeLoad: () => {
    redirect({
      to: '/explorer/$type',
      params: { type: 'token-pair' },
      throw: true,
    });
  },
});

export const explorerPage = new Route({
  getParentRoute: () => explorerLayout,
  path: '$type',
  parseParams: (params: Record<string, string>) => {
    return { type: params.type as ExplorerType };
  },
  component: ExplorerPage,
});

export const explorerTypePage = new Route({
  getParentRoute: () => explorerPage,
  path: '/',
  component: ExplorerTypePage,
});

export const explorerResultLayout = new Route({
  getParentRoute: () => explorerPage,
  path: '$slug',
});

export const explorerOverviewPage = new Route({
  getParentRoute: () => explorerResultLayout,
  path: '/',
  component: ExplorerTypeOverviewPage,
});

export const explorerPortfolioLayout = new Route({
  getParentRoute: () => explorerResultLayout,
  path: 'portfolio',
});

export const explorerPortfolioPage = new Route({
  getParentRoute: () => explorerPortfolioLayout,
  path: '/',
  component: ExplorerTypePortfolioPage,
});

export const explorerPortfolioTokenPage = new Route({
  getParentRoute: () => explorerPortfolioLayout,
  path: 'token/$address',
  component: ExplorerTypePortfolioTokenPage,
});
