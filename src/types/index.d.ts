export type TachiSource = {
  id: string;
  name: string;
  lang: string;
  iconUrl: string;
  displayName: string;
  isNsfw: boolean;
};

export type TachiManga = {
  id: number;
  sourceId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  description: string;
  status: TachiStatus;
  realUrl: string;
  artist?: string;
  author?: string;
  status: TachiStatus;
  genre?: string[];
};

export type TachiFilter = {
  type: string;
  filter: {
    name: string;
    state: any;
  };
};

export type TachiSearchResponse = {
  hasNextPage: boolean;
  mangaList: TachiManga[];
};

export type TachiChapter = {
  url: string;
  chapterNumber: number;
  uploadDate: Date;
  index: number;
  mangaId: number;
  name?: string;
};
