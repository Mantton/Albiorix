import {
  ChapterPage,
  Content,
  Filter,
  Highlight,
  Property,
  SourceInfo,
} from "@suwatte/daisuke";
import { convertStatus } from "../constants";
import * as TachiDesk from "../services/tachidesk.service";
import { TachiChapter, TachiManga, TachiSource } from "../types";
import { TACHIDESK_URL } from "./secrets";

export const thumbnail = (path: string) => {
  return TACHIDESK_URL + path;
};
export const parseHighlight = (data: TachiManga): Highlight => {
  return {
    contentId: data.id.toString(),
    title: data.title,
    cover: TACHIDESK_URL + data.thumbnailUrl,
  };
};

export const parseProperties = async (genres: string[], sourceId: string) => {
  const properties: Property[] = [];

  const filters = await TachiDesk.sourceFilters(sourceId);
  for (const filter of filters) {
    const tags = filter.property.tags.filter((v) => genres.includes(v.label));

    if (tags.length == 0) continue;
    properties.push({
      ...filter.property,
      tags: tags,
    });
  }
  return properties.filter((v) => v.tags.length != 0);
};

export const parseContent = async (
  data: TachiManga,
  sourceId: string
): Promise<Content> => {
  const genres = data.genre ?? [];
  const properties = await parseProperties(genres, sourceId);
  const nonInteractiveTags = genres.filter(
    (v) => !properties.flatMap((v) => v.label).includes(v)
  );
  return {
    contentId: data.id.toString(),
    title: data.title,
    webUrl: data.realUrl,
    cover: thumbnail(data.thumbnailUrl),
    summary: data.description,
    creators: [
      ...(data.artist?.split(", ") ?? []),
      ...(data.author?.split(", ") ?? []),
    ].filter((v) => v.length != 0),
    status: convertStatus(data.status),
    properties,
    nonInteractiveProperties: [
      {
        id: "default",
        label: "Other Info",
        tags: nonInteractiveTags,
      },
    ],
  };
};

export const parseChapter = (
  data: TachiChapter[],
  contentId: string,
  lang: string | null
) => {
  return data.map((v, i) => ({
    index: i,
    number: v.chapterNumber,
    contentId: contentId,
    chapterId: v.index.toString(),
    date: new Date(v.uploadDate),
    title: v.name,
    language: lang ?? "GB", // TODO: Fix This
  }));
};

export const parseChapterData = (
  data: any,
  contentId: string,
  chapterId: string
) => {
  const url = `${TACHIDESK_URL}/manga/${contentId}/chapter/${chapterId}`;

  const pageCount = data.pageCount;
  const pages: ChapterPage[] = Array(pageCount)
    .fill("")
    .map((_, i) => ({
      url: `${url}/page/${i}`,
    }));

  return {
    pages,
    chapterId,
    contentId,
  };
};

export const parseSearchResults = () => {};

export const parseSource = (v: TachiSource): SourceInfo => {
  return {
    id: v.id,
    name: `${v.name} (${v.lang.toUpperCase()})`,
    supportedLanguages: [v.lang.toUpperCase()],
    hasExplorePage: false,
    primarilyAdultContent: v.isNsfw,
    thumbnail: thumbnail(v.iconUrl),
    version: 0.1,
    website: "",
  };
};
