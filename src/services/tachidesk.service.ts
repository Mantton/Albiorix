import { Filter, SearchRequest, SearchSort, Tag } from "@suwatte/daisuke";
import axios, { Axios } from "axios";
import { FILTER_CACHE } from "../constants";
import {
  TachiChapter,
  TachiFilter,
  TachiManga,
  TachiSearchResponse,
  TachiSource,
} from "../types";
import {
  parseChapter,
  parseChapterData,
  parseContent,
  parseHighlight,
  parseSource,
} from "../utils/parser";
import { TACHIDESK_URL } from "../utils/secrets";

const API = new Axios({
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },
  baseURL: TACHIDESK_URL + "/api/v1",
});

export const content = async (sourceId: string, contentId: string) => {
  const response = await API.get(`/manga/${contentId}/?onlineFetch=true`);
  return parseContent(JSON.parse(response.data), sourceId);
};

export const tachiFilters = async (sourceId: string) => {
  const response = await API.get(`/source/${sourceId}/filters`);
  return JSON.parse(response.data) as TachiFilter[];
};

export const sourceFilters = async (sourceId: string) => {
  if (FILTER_CACHE[sourceId]) return FILTER_CACHE[sourceId];
  const filters: Filter[] = [];
  const f = await tachiFilters(sourceId);
  for (let index = 0; index < f.length; index++) {
    const data = f[index];
    const type = data.type.toLowerCase();
    if (type === "checkbox") {
      filters.push({
        canExclude: false,
        property: {
          id: `${index}|0`,
          label: data.filter.name,
          tags: [
            {
              id: "checkbox_default",
              label: "True",
              adultContent: false,
            },
          ],
        },
        id: index.toString(),
      });
      continue;
    }

    if (type === "group") {
      const state: any[] = data.filter.state;
      if (state.every((v) => v.type === "CheckBox")) {
        const tags: Tag[] = state.map((v, i) => ({
          id: `${index}|${i}`,
          label: v.filter.name,
          adultContent: false,
        }));

        filters.push({
          canExclude: false,
          property: {
            id: index.toString(),
            label: data.filter.name,
            tags,
          },
          id: index.toString(),
        });
      } else if (state.every((v) => v.type === "TriState")) {
        const tags: Tag[] = state.map((v, i) => ({
          id: `${index}|${i}`,
          label: v.filter.name,
          adultContent: false,
        }));

        filters.push({
          id: index.toString(),
          canExclude: true,
          property: {
            id: index.toString(),
            label: data.filter.name,
            tags,
          },
        });
      }
    }
  }

  FILTER_CACHE[sourceId] = filters;
  return filters;
};

export const sources = async (langs: string[]) => {
  const response = await API.get("/source/list");
  const data: TachiSource[] = JSON.parse(response.data);
  const filtered =
    langs.length == 0 ? data : data.filter((v) => langs.includes(v.lang));
  return filtered.map((v) => parseSource(v));
};

export const chapters = async (_: string, contentId: string) => {
  const response = await API.get(
    `/manga/${contentId}/chapters/?onlineFetch=true`
  );
  const data = JSON.parse(response.data) as TachiChapter[];
  return parseChapter(data, contentId, null);
};

export const chapterData = async (
  _: string,
  contentId: string,
  chapterId: string
) => {
  const response = await API.get(`/manga/${contentId}/chapter/${chapterId}`);
  return parseChapterData(JSON.parse(response.data), contentId, chapterId);
};

export const search = async (sourceId: string, query: SearchRequest) => {
  await prepare(sourceId, query);
  // Page Number
  const num = query.page
    ? typeof query.page != "number"
      ? parseInt(query.page)
      : query.page
    : 1;
  const page = num >= 1 ? num : 1;
  const response = await API.get(`/source/${sourceId}/search`, {
    params: {
      pageNum: page,
      searchTerm: query.query ?? "",
    },
  });

  const data: TachiSearchResponse = JSON.parse(response.data);
  return {
    isLastPage: !data.hasNextPage,
    results: data.mangaList.map(parseHighlight),
    page,
  };
};

export const reset = async (sourceId: string) => {
  await API.get(`/source/${sourceId}/filters?reset=true`);
};

// Searching
export const prepare = async (sourceId: string, query: SearchRequest) => {
  const filters = await tachiFilters(sourceId);
  await reset(sourceId);
  const positions: any[] = [];

  // Sorting
  if (query.sort) {
    const id = parseInt(query.sort.id);
    const position = filters.findIndex((v) => v.type === "Sort");
    positions.push({
      position,
      state: JSON.stringify({ index: id, ascending: "false" }),
    });
  }
  // Included Tags
  if (query.includedTags) {
    const includedPositions = query.includedTags.map((v) => {
      const [pos1, pos2] = v.split("|");
      const filterPosition = parseInt(pos1);
      const statePosition = parseInt(pos2);

      const filter = filters[filterPosition];

      if (filter.type === "CheckBox") {
        return {
          position: filterPosition,
          state: "true",
        };
      }

      const state = filter.filter.state[statePosition];

      // CheckBox In Group
      if (state.type === "CheckBox") {
        return {
          position: filterPosition,
          state: JSON.stringify({
            position: statePosition,
            state: "true",
          }),
        };
      }

      // TriState in Group
      return {
        position: filterPosition,
        state: JSON.stringify({
          position: statePosition,
          state: "1",
        }),
      };
    });
    positions.push(...includedPositions);
  }

  // Excluded Tags
  if (query.excludedTags) {
    const excludedPositions = query.excludedTags.map((v) => {
      const [pos1, pos2] = v.split("|");
      const filterPosition = parseInt(pos1);
      const statePosition = parseInt(pos2);
      return {
        position: filterPosition,
        state: JSON.stringify({
          position: statePosition,
          state: "2",
        }),
      };
    });
    positions.push(...excludedPositions);
  }
  await reset(sourceId);
  if (positions.length !== 0) {
    await setFilters(sourceId, positions);
  }
};

const setFilters = async (sourceId: string, data: any) => {
  await axios.post(`${TACHIDESK_URL}/api/v1/source/${sourceId}/filters`, data);
};

export const sorters = async (sourceId: string): Promise<SearchSort[]> => {
  const filters = await tachiFilters(sourceId);
  const group = filters.filter((v) => v.type === "Sort")?.[0] as
    | any
    | undefined;

  if (!group) {
    return [];
  }

  return group.filter.values.map((v: string, i: number) => ({
    label: v,
    id: i.toString(),
  }));
};
