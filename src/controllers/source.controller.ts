import { RunnerType, SearchRequest } from "@suwatte/daisuke";
import { RequestHandler } from "express";
import * as TachiDesk from "../services/tachidesk.service";
import { z, ZodError } from "zod";
export const handleFetchRunnerList: RequestHandler = async (req, res, next) => {
  try {
    const runners = await TachiDesk.sources(["en"]);
    const data = {
      runners: runners.map((v) => ({
        ...v,
        path: v.id,
        type: RunnerType.CONTENT_SOURCE,
      })),
      listName: "Albiorix",
      hosted: true,
    };

    res.send(data);
  } catch (err) {
    next(err);
  }
};
export const handleFetchSources: RequestHandler = async (req, res, next) => {
  res.send(await TachiDesk.sources(["en"]));
};
export const handleFetchContent: RequestHandler = async (req, res, next) => {
  const { sourceId, contentId } = req.params;
  try {
    const data = await TachiDesk.content(sourceId, contentId);
    res.send(data);
  } catch (err) {
    next(err);
  }
};
export const handleFetchChapters: RequestHandler = async (req, res, next) => {
  const { sourceId, contentId } = req.params;

  try {
    const data = await TachiDesk.chapters(sourceId, contentId);
    res.send(data);
  } catch (err) {
    next(err);
  }
};
export const handleFetchChapterData: RequestHandler = async (
  req,
  res,
  next
) => {
  const { sourceId, contentId, chapterId } = req.params;

  try {
    const data = await TachiDesk.chapterData(sourceId, contentId, chapterId);
    res.send(data);
  } catch (err) {
    next(err);
  }
};
export const handleFetchSearchSorters: RequestHandler = async (
  req,
  res,
  next
) => {
  const { sourceId } = req.params;

  try {
    const data = await TachiDesk.sorters(sourceId);
    res.send(data);
  } catch (err) {
    next(err);
  }
};
export const handleFetchSearchFilters: RequestHandler = async (
  req,
  res,
  next
) => {
  const { sourceId } = req.params;

  try {
    const data = await TachiDesk.sourceFilters(sourceId);
    res.send(data);
  } catch (err) {
    next(err);
  }
};
export const handleFetchSearchResults: RequestHandler = async (
  req,
  res,
  next
) => {
  const { sourceId } = req.params;
  const schema = z.object({
    query: z.object({
      query: z.string().optional(),
      page: z.number().int().optional(),
      includedTags: z.array(z.string()).optional(),
      excludedTags: z.array(z.string()).optional(),
      sort: z
        .object({
          label: z.string(),
          id: z.string(),
        })
        .optional(),
    }),
  });

  try {
    const { query } = await schema.parseAsync(req.body);
    const data = await TachiDesk.search(sourceId, query);
    res.send(data);
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).send({ msg: "validation failed", err: err.message });
    }
  }
};
