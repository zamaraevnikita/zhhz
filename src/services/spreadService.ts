import { PageData, PageType, Spread } from '../types';
import { generateId } from '../utils';

export const createPage = (type: PageType = 'content', layoutId = 'full_photo'): PageData => ({
  id: generateId(),
  layoutId,
  type,
  content: {},
  slotSettings: {}
});

export const createSpread = (leftType: PageType, rightType: PageType): Spread => ({
  id: generateId(),
  leftPage: createPage(leftType),
  rightPage: createPage(rightType),
});

export const generateSpreads = (): Spread[] => {
  const coverSpread = createSpread('cover', 'content');
  const frontFlyleafSpread = createSpread('flyleaf', 'content');
  const contentSpreads = Array.from({ length: 8 }, () => createSpread('content', 'content'));
  const backFlyleafSpread = createSpread('content', 'flyleaf');
  return [coverSpread, frontFlyleafSpread, ...contentSpreads, backFlyleafSpread];
};
