import { eq } from "drizzle-orm";
import { siteAppearanceSettings } from "@/db/schema";
import type { Database } from "@/lib/db";
import { sanitizeMediaKey, sanitizePlainText } from "@/lib/security";

export interface SiteNavLink {
	label: string;
	href: string;
}

export interface SiteAppearance {
	backgroundImageKey: string | null;
	backgroundBlur: number;
	backgroundScale: number;
	backgroundPositionX: number;
	backgroundPositionY: number;
	headerSubtitle: string;
	navLink1Label: string;
	navLink1Href: string;
	navLink2Label: string;
	navLink2Href: string;
	navLink3Label: string;
	navLink3Href: string;
	heroKicker: string;
	heroTitle: string;
	heroIntro: string;
	heroPrimaryLabel: string;
	heroPrimaryHref: string;
	heroSecondaryLabel: string;
	heroSecondaryHref: string;
	heroSignalLabel: string;
	heroSignalHeading: string;
	heroSignalCopy: string;
	heroTopicText: string;
	heroWritingText: string;
}

export const DEFAULT_SITE_APPEARANCE: SiteAppearance = {
	backgroundImageKey: null,
	backgroundBlur: 24,
	backgroundScale: 112,
	backgroundPositionX: 50,
	backgroundPositionY: 50,
	headerSubtitle: "流畅、克制、持续更新的技术写作",
	navLink1Label: "首页",
	navLink1Href: "/",
	navLink2Label: "归档",
	navLink2Href: "/blog",
	navLink3Label: "搜索",
	navLink3Href: "/search",
	heroKicker: "云端记录",
	heroTitle: "把工程判断写清楚，把技术细节写漂亮。",
	heroIntro:
		"这里记录 Cloudflare、前端工程、调试过程和系统设计里那些值得反复回看的瞬间。界面会继续打磨，但内容先要足够清晰、足够耐读。",
	heroPrimaryLabel: "进入归档",
	heroPrimaryHref: "/blog",
	heroSecondaryLabel: "站内搜索",
	heroSecondaryHref: "/search",
	heroSignalLabel: "Scene Depth",
	heroSignalHeading: "首页会跟着你的视线轻轻转一下",
	heroSignalCopy:
		"不是把页面做得很吵，而是只让首屏层次、信息胶囊和按钮反馈更有呼吸感。",
	heroTopicText: "Cloudflare · 前端工程 · 架构细节",
	heroWritingText: "慢一点，但尽量长期有效。",
};

function clampInteger(
	value: unknown,
	min: number,
	max: number,
	fallback: number,
) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		return fallback;
	}

	return Math.min(max, Math.max(min, Math.round(parsed)));
}

function normalizeText(value: unknown, maxLength: number, fallback: string) {
	const normalized = sanitizePlainText(value, maxLength);
	return normalized || fallback;
}

function normalizeLongText(
	value: unknown,
	maxLength: number,
	fallback: string,
) {
	const normalized = sanitizePlainText(value, maxLength, {
		allowNewlines: true,
	});
	return normalized || fallback;
}

function normalizeLinkHref(value: unknown, fallback: string) {
	const normalized = sanitizePlainText(value, 240);
	if (!normalized) {
		return fallback;
	}

	if (normalized.startsWith("/")) {
		return normalized.startsWith("//") ? fallback : normalized;
	}

	try {
		const url = new URL(normalized);
		return ["http:", "https:"].includes(url.protocol)
			? url.toString()
			: fallback;
	} catch {
		return fallback;
	}
}

export function normalizeSiteAppearanceInput(
	input: Partial<SiteAppearance>,
): SiteAppearance {
	return {
		backgroundImageKey: input.backgroundImageKey
			? sanitizeMediaKey(input.backgroundImageKey)
			: null,
		backgroundBlur: clampInteger(
			input.backgroundBlur,
			0,
			60,
			DEFAULT_SITE_APPEARANCE.backgroundBlur,
		),
		backgroundScale: clampInteger(
			input.backgroundScale,
			100,
			180,
			DEFAULT_SITE_APPEARANCE.backgroundScale,
		),
		backgroundPositionX: clampInteger(
			input.backgroundPositionX,
			0,
			100,
			DEFAULT_SITE_APPEARANCE.backgroundPositionX,
		),
		backgroundPositionY: clampInteger(
			input.backgroundPositionY,
			0,
			100,
			DEFAULT_SITE_APPEARANCE.backgroundPositionY,
		),
		headerSubtitle: normalizeText(
			input.headerSubtitle,
			120,
			DEFAULT_SITE_APPEARANCE.headerSubtitle,
		),
		navLink1Label: normalizeText(
			input.navLink1Label,
			24,
			DEFAULT_SITE_APPEARANCE.navLink1Label,
		),
		navLink1Href: normalizeLinkHref(
			input.navLink1Href,
			DEFAULT_SITE_APPEARANCE.navLink1Href,
		),
		navLink2Label: normalizeText(
			input.navLink2Label,
			24,
			DEFAULT_SITE_APPEARANCE.navLink2Label,
		),
		navLink2Href: normalizeLinkHref(
			input.navLink2Href,
			DEFAULT_SITE_APPEARANCE.navLink2Href,
		),
		navLink3Label: normalizeText(
			input.navLink3Label,
			24,
			DEFAULT_SITE_APPEARANCE.navLink3Label,
		),
		navLink3Href: normalizeLinkHref(
			input.navLink3Href,
			DEFAULT_SITE_APPEARANCE.navLink3Href,
		),
		heroKicker: normalizeText(
			input.heroKicker,
			24,
			DEFAULT_SITE_APPEARANCE.heroKicker,
		),
		heroTitle: normalizeText(
			input.heroTitle,
			120,
			DEFAULT_SITE_APPEARANCE.heroTitle,
		),
		heroIntro: normalizeLongText(
			input.heroIntro,
			600,
			DEFAULT_SITE_APPEARANCE.heroIntro,
		),
		heroPrimaryLabel: normalizeText(
			input.heroPrimaryLabel,
			24,
			DEFAULT_SITE_APPEARANCE.heroPrimaryLabel,
		),
		heroPrimaryHref: normalizeLinkHref(
			input.heroPrimaryHref,
			DEFAULT_SITE_APPEARANCE.heroPrimaryHref,
		),
		heroSecondaryLabel: normalizeText(
			input.heroSecondaryLabel,
			24,
			DEFAULT_SITE_APPEARANCE.heroSecondaryLabel,
		),
		heroSecondaryHref: normalizeLinkHref(
			input.heroSecondaryHref,
			DEFAULT_SITE_APPEARANCE.heroSecondaryHref,
		),
		heroSignalLabel: normalizeText(
			input.heroSignalLabel,
			30,
			DEFAULT_SITE_APPEARANCE.heroSignalLabel,
		),
		heroSignalHeading: normalizeText(
			input.heroSignalHeading,
			120,
			DEFAULT_SITE_APPEARANCE.heroSignalHeading,
		),
		heroSignalCopy: normalizeLongText(
			input.heroSignalCopy,
			300,
			DEFAULT_SITE_APPEARANCE.heroSignalCopy,
		),
		heroTopicText: normalizeText(
			input.heroTopicText,
			120,
			DEFAULT_SITE_APPEARANCE.heroTopicText,
		),
		heroWritingText: normalizeText(
			input.heroWritingText,
			120,
			DEFAULT_SITE_APPEARANCE.heroWritingText,
		),
	};
}

export function buildSiteNavLinks(appearance: SiteAppearance): SiteNavLink[] {
	return [
		{
			label: appearance.navLink1Label,
			href: appearance.navLink1Href,
		},
		{
			label: appearance.navLink2Label,
			href: appearance.navLink2Href,
		},
		{
			label: appearance.navLink3Label,
			href: appearance.navLink3Href,
		},
	];
}

export async function getSiteAppearance(db: Database): Promise<SiteAppearance> {
	const [row] = await db
		.select({
			backgroundImageKey: siteAppearanceSettings.backgroundImageKey,
			backgroundBlur: siteAppearanceSettings.backgroundBlur,
			backgroundScale: siteAppearanceSettings.backgroundScale,
			backgroundPositionX: siteAppearanceSettings.backgroundPositionX,
			backgroundPositionY: siteAppearanceSettings.backgroundPositionY,
			headerSubtitle: siteAppearanceSettings.headerSubtitle,
			navLink1Label: siteAppearanceSettings.navLink1Label,
			navLink1Href: siteAppearanceSettings.navLink1Href,
			navLink2Label: siteAppearanceSettings.navLink2Label,
			navLink2Href: siteAppearanceSettings.navLink2Href,
			navLink3Label: siteAppearanceSettings.navLink3Label,
			navLink3Href: siteAppearanceSettings.navLink3Href,
			heroKicker: siteAppearanceSettings.heroKicker,
			heroTitle: siteAppearanceSettings.heroTitle,
			heroIntro: siteAppearanceSettings.heroIntro,
			heroPrimaryLabel: siteAppearanceSettings.heroPrimaryLabel,
			heroPrimaryHref: siteAppearanceSettings.heroPrimaryHref,
			heroSecondaryLabel: siteAppearanceSettings.heroSecondaryLabel,
			heroSecondaryHref: siteAppearanceSettings.heroSecondaryHref,
			heroSignalLabel: siteAppearanceSettings.heroSignalLabel,
			heroSignalHeading: siteAppearanceSettings.heroSignalHeading,
			heroSignalCopy: siteAppearanceSettings.heroSignalCopy,
			heroTopicText: siteAppearanceSettings.heroTopicText,
			heroWritingText: siteAppearanceSettings.heroWritingText,
		})
		.from(siteAppearanceSettings)
		.where(eq(siteAppearanceSettings.id, 1))
		.limit(1);

	if (!row) {
		return DEFAULT_SITE_APPEARANCE;
	}

	return normalizeSiteAppearanceInput(row);
}

export async function saveSiteAppearance(
	db: Database,
	input: Partial<SiteAppearance>,
) {
	const normalized = normalizeSiteAppearanceInput(input);

	await db
		.insert(siteAppearanceSettings)
		.values({
			id: 1,
			backgroundImageKey: normalized.backgroundImageKey,
			backgroundBlur: normalized.backgroundBlur,
			backgroundScale: normalized.backgroundScale,
			backgroundPositionX: normalized.backgroundPositionX,
			backgroundPositionY: normalized.backgroundPositionY,
			headerSubtitle: normalized.headerSubtitle,
			navLink1Label: normalized.navLink1Label,
			navLink1Href: normalized.navLink1Href,
			navLink2Label: normalized.navLink2Label,
			navLink2Href: normalized.navLink2Href,
			navLink3Label: normalized.navLink3Label,
			navLink3Href: normalized.navLink3Href,
			heroKicker: normalized.heroKicker,
			heroTitle: normalized.heroTitle,
			heroIntro: normalized.heroIntro,
			heroPrimaryLabel: normalized.heroPrimaryLabel,
			heroPrimaryHref: normalized.heroPrimaryHref,
			heroSecondaryLabel: normalized.heroSecondaryLabel,
			heroSecondaryHref: normalized.heroSecondaryHref,
			heroSignalLabel: normalized.heroSignalLabel,
			heroSignalHeading: normalized.heroSignalHeading,
			heroSignalCopy: normalized.heroSignalCopy,
			heroTopicText: normalized.heroTopicText,
			heroWritingText: normalized.heroWritingText,
		})
		.onConflictDoUpdate({
			target: siteAppearanceSettings.id,
			set: {
				backgroundImageKey: normalized.backgroundImageKey,
				backgroundBlur: normalized.backgroundBlur,
				backgroundScale: normalized.backgroundScale,
				backgroundPositionX: normalized.backgroundPositionX,
				backgroundPositionY: normalized.backgroundPositionY,
				headerSubtitle: normalized.headerSubtitle,
				navLink1Label: normalized.navLink1Label,
				navLink1Href: normalized.navLink1Href,
				navLink2Label: normalized.navLink2Label,
				navLink2Href: normalized.navLink2Href,
				navLink3Label: normalized.navLink3Label,
				navLink3Href: normalized.navLink3Href,
				heroKicker: normalized.heroKicker,
				heroTitle: normalized.heroTitle,
				heroIntro: normalized.heroIntro,
				heroPrimaryLabel: normalized.heroPrimaryLabel,
				heroPrimaryHref: normalized.heroPrimaryHref,
				heroSecondaryLabel: normalized.heroSecondaryLabel,
				heroSecondaryHref: normalized.heroSecondaryHref,
				heroSignalLabel: normalized.heroSignalLabel,
				heroSignalHeading: normalized.heroSignalHeading,
				heroSignalCopy: normalized.heroSignalCopy,
				heroTopicText: normalized.heroTopicText,
				heroWritingText: normalized.heroWritingText,
			},
		});

	return normalized;
}

export function buildBackgroundImageUrl(key: string | null) {
	return key ? `/media/${key}` : null;
}
