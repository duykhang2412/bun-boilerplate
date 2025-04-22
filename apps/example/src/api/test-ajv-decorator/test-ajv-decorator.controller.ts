import { ajvValidator, getAjvSchema } from "@packages/ajv-decorator";
import { Hono } from "hono";
import type { Context } from "hono";
import { TestAjvDto, TestTrimDto } from "../../dtos";
import { ROUTES } from "../../routes/routes";

const TestAjvDecoratorController = new Hono();

TestAjvDecoratorController.post(
    ROUTES.TestAjv,
    ajvValidator('json', getAjvSchema(TestAjvDto)),
    async (c: Context) => {
        const data = await c.req.json();
        return c.json({
            ok: true,
            data: data
        });
    },
)

TestAjvDecoratorController.post(
    ROUTES.TestTrimData,
    ajvValidator('json', getAjvSchema(TestTrimDto)),
    async (c: Context) => {
        const data = await c.req.json();
        return c.json({
            ok: true,
            data: data,
        });
    },
)

export default TestAjvDecoratorController;