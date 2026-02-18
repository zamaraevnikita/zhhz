import { LayoutTemplate, SlotType } from '../types';

// Helper to standard padding
const P_STD = 'p-6';

export const LAYOUTS: LayoutTemplate[] = [
  {
    id: 'full_photo',
    name: 'Полное фото',
    tags: ['universal', 'lookbook', 'memories', 'travel', 'year', 'soulmates', 'valentine', 'astrology'],
    thumbnail: 'border-2 border-gray-400 bg-gray-200',
    gridConfig: `grid grid-cols-1 grid-rows-1 ${P_STD}`,
    slots: [
      { id: 's1', type: SlotType.IMAGE, className: 'row-span-1 col-span-1' }
    ]
  },
  {
    id: 'circle_center',
    name: 'Круг по центру',
    tags: ['love', 'astrology', 'valentine', 'soulmates'],
    thumbnail: 'flex items-center justify-center',
    gridConfig: 'grid grid-cols-1 grid-rows-1 place-items-center',
    slots: [
      { id: 's1', type: SlotType.IMAGE, className: 'w-[60%] aspect-square rounded-full shadow-lg overflow-hidden' }
    ]
  },
  {
    id: 'polaroid_style',
    name: 'Полароид',
    tags: ['memories', 'love', 'travel', 'valentine', 'soulmates'],
    thumbnail: 'flex flex-col items-center p-2 border',
    gridConfig: 'grid grid-cols-1 grid-rows-6 p-8', // Removed hardcoded bg-gray-50 to allow theme bg
    slots: [
      { id: 's1', type: SlotType.IMAGE, className: 'row-span-4 shadow-md border-[8px] sm:border-[12px] border-white bg-white' },
      { id: 't1', type: SlotType.TEXT, className: 'row-span-2 pt-4 text-center font-handwriting', placeholder: 'Подпись...' }
    ]
  },
  {
    id: 'photo_bottom_text_top',
    name: 'История сверху',
    tags: ['universal', 'memories', 'year'],
    thumbnail: 'flex flex-col gap-1',
    gridConfig: `grid grid-cols-1 grid-rows-6 gap-4 ${P_STD}`,
    slots: [
      { id: 't1', type: SlotType.TEXT, className: 'row-span-1', placeholder: 'Введите заголовок...' },
      { id: 's1', type: SlotType.IMAGE, className: 'row-span-5' }
    ]
  },
  {
    id: 'photo_top_text_bottom',
    name: 'История снизу',
    tags: ['universal', 'memories', 'travel'],
    thumbnail: 'flex flex-col-reverse gap-1',
    gridConfig: `grid grid-cols-1 grid-rows-6 gap-4 ${P_STD}`,
    slots: [
      { id: 's1', type: SlotType.IMAGE, className: 'row-span-5' },
      { id: 't1', type: SlotType.TEXT, className: 'row-span-1', placeholder: 'Ваш текст...' }
    ]
  },
  {
    id: 'two_vertical',
    name: 'Два вертикально',
    tags: ['lookbook', 'universal', 'memories', 'travel', 'year'],
    thumbnail: 'grid grid-rows-2 gap-1',
    gridConfig: `grid grid-cols-1 grid-rows-2 gap-4 ${P_STD}`,
    slots: [
      { id: 's1', type: SlotType.IMAGE, className: 'row-span-1' },
      { id: 's2', type: SlotType.IMAGE, className: 'row-span-1' }
    ]
  },
  {
      id: 'three_row',
      name: 'Три в ряд',
      tags: ['universal', 'year', 'memories'],
      thumbnail: 'grid grid-rows-3 gap-1',
      gridConfig: `grid grid-cols-1 grid-rows-3 gap-4 ${P_STD}`,
      slots: [
          { id: 's1', type: SlotType.IMAGE, className: '' },
          { id: 's2', type: SlotType.IMAGE, className: '' },
          { id: 's3', type: SlotType.IMAGE, className: '' }
      ]
  },
  {
    id: 'four_grid',
    name: 'Сетка 2x2',
    tags: ['universal', 'lookbook', 'year', 'travel'],
    thumbnail: 'grid grid-cols-2 grid-rows-2 gap-1',
    gridConfig: `grid grid-cols-2 grid-rows-2 gap-4 ${P_STD}`,
    slots: [
      { id: 's1', type: SlotType.IMAGE, className: '' },
      { id: 's2', type: SlotType.IMAGE, className: '' },
      { id: 's3', type: SlotType.IMAGE, className: '' },
      { id: 's4', type: SlotType.IMAGE, className: '' }
    ]
  },
  {
      id: 'collage_asym',
      name: 'Асимметрия',
      tags: ['lookbook', 'travel'],
      thumbnail: 'grid grid-cols-2 grid-rows-2 gap-1',
      gridConfig: `grid grid-cols-2 grid-rows-2 gap-2 ${P_STD}`,
      slots: [
        { id: 's1', type: SlotType.IMAGE, className: 'row-span-2 col-span-1' },
        { id: 's2', type: SlotType.IMAGE, className: 'col-span-1 h-full' },
        { id: 's3', type: SlotType.IMAGE, className: 'col-span-1 h-full' }
      ]
    },
  {
    id: 'photo_inset',
    name: 'Рамка',
    tags: ['memories', 'love', 'valentine', 'soulmates'],
    thumbnail: 'flex items-center justify-center p-2',
    gridConfig: 'grid grid-cols-6 grid-rows-6 p-6',
    slots: [
      { id: 's1', type: SlotType.IMAGE, className: 'col-start-2 col-span-4 row-start-2 row-span-4 shadow-xl' }
    ]
  },
  {
      id: 'left_bar_text',
      name: 'Текст сбоку',
      tags: ['universal', 'memories'],
      thumbnail: 'grid grid-cols-3 gap-1',
      gridConfig: `grid grid-cols-3 grid-rows-1 gap-4 ${P_STD}`,
      slots: [
          { id: 't1', type: SlotType.TEXT, className: 'col-span-1', placeholder: 'Заметки...' },
          { id: 's1', type: SlotType.IMAGE, className: 'col-span-2' }
      ]
  },
  {
    id: 'text_heavy',
    name: 'Только текст',
    tags: ['universal', 'memories', 'valentine'],
    thumbnail: 'border border-dashed border-gray-400',
    gridConfig: 'grid grid-cols-1 grid-rows-1 p-12',
    slots: [
      { id: 't1', type: SlotType.TEXT, className: 'h-full', placeholder: 'Начните писать вашу историю здесь...' }
    ]
  },
  {
      id: 'checkerboard',
      name: 'Шахматы',
      tags: ['universal', 'year'],
      thumbnail: 'grid grid-cols-2 gap-1',
      gridConfig: `grid grid-cols-2 grid-rows-2 gap-4 ${P_STD}`,
      slots: [
          { id: 's1', type: SlotType.IMAGE, className: '' },
          { id: 't1', type: SlotType.TEXT, className: 'flex items-center justify-center text-center', placeholder: 'Текст' },
          { id: 't2', type: SlotType.TEXT, className: 'flex items-center justify-center text-center', placeholder: 'Текст' },
          { id: 's2', type: SlotType.IMAGE, className: '' }
      ]
  }
];