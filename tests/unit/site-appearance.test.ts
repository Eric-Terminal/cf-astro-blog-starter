import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
	buildBackgroundImageUrl,
	buildSiteNavLinks,
	DEFAULT_SITE_APPEARANCE,
	normalizeSiteAppearanceInput,
} from "../../src/lib/site-appearance";

describe("站点外观设置喵", () => {
	test("normalizeSiteAppearanceInput 会约束裁切和模糊范围喵", () => {
		const normalized = normalizeSiteAppearanceInput({
			backgroundImageKey: "appearance/background/2026-03-07/example.webp",
			backgroundBlur: 88,
			backgroundScale: 220,
			backgroundPositionX: -10,
			backgroundPositionY: 140,
		});

		assert.equal(
			normalized.backgroundImageKey,
			"appearance/background/2026-03-07/example.webp",
		);
		assert.equal(normalized.backgroundBlur, 60);
		assert.equal(normalized.backgroundScale, 180);
		assert.equal(normalized.backgroundPositionX, 0);
		assert.equal(normalized.backgroundPositionY, 100);
	});

	test("normalizeSiteAppearanceInput 会回退到默认值喵", () => {
		const normalized = normalizeSiteAppearanceInput({
			backgroundImageKey: "%%%bad-key%%%",
			navLink1Href: "javascript:alert(1)",
			heroPrimaryHref: "ftp://bad.example.com",
			heroTitle: "",
		});

		assert.deepEqual(normalized, DEFAULT_SITE_APPEARANCE);
	});

	test("normalizeSiteAppearanceInput 会保留合法的文案与链接喵", () => {
		const normalized = normalizeSiteAppearanceInput({
			headerSubtitle: "我的状态栏",
			navLink1Label: "文档",
			navLink1Href: "https://example.com/docs",
			heroTitle: "新的首页主标题",
			heroIntro: "新的简介内容",
			heroSecondaryHref: "/search?tag=astro",
		});

		assert.equal(normalized.headerSubtitle, "我的状态栏");
		assert.equal(normalized.navLink1Label, "文档");
		assert.equal(normalized.navLink1Href, "https://example.com/docs");
		assert.equal(normalized.heroTitle, "新的首页主标题");
		assert.equal(normalized.heroIntro, "新的简介内容");
		assert.equal(normalized.heroSecondaryHref, "/search?tag=astro");
	});

	test("buildSiteNavLinks 会按顺序生成顶部导航数据喵", () => {
		const links = buildSiteNavLinks(DEFAULT_SITE_APPEARANCE);

		assert.equal(links.length, 3);
		assert.deepEqual(links[0], { label: "首页", href: "/" });
		assert.deepEqual(links[1], { label: "归档", href: "/blog" });
		assert.deepEqual(links[2], { label: "搜索", href: "/search" });
	});

	test("buildBackgroundImageUrl 会生成公开媒体地址喵", () => {
		assert.equal(
			buildBackgroundImageUrl("appearance/background/2026-03-07/example.webp"),
			"/media/appearance/background/2026-03-07/example.webp",
		);
		assert.equal(buildBackgroundImageUrl(null), null);
	});
});
