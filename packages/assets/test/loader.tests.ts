import type { ImageResource } from '@pixi/core';
import { Texture } from '@pixi/core';
import type { Spritesheet } from '@pixi/spritesheet';
import { BitmapFont } from '@pixi/text-bitmap';

import type {
    LoaderParser } from '@pixi/assets';
import {
    Cache,
    cacheSpritesheet,
    loadBitmapFont,
    loadJson,
    loadSpritesheet,
    loadTextures,
    loadTxt,
    loadWebFont,
    loadSVG
} from '@pixi/assets';
import { Loader } from '../src/loader/Loader';

describe('Loader', () =>
{
    const serverPath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/assets/test/assets/`
        : 'http://localhost:8080/assets/test/assets/';

    beforeEach(() =>
    {
        Cache.reset();
    });

    it('should load a single image', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const texture: Texture = await loader.load(`${serverPath}textures/bunny.png`);

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(26);
        expect(texture.height).toBe(37);
    });

    it('should load an svg', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadSVG);

        const texture: Texture = await loader.load(`${serverPath}svg/logo.svg`);

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(512);
        expect(texture.height).toBe(512);
    });

    it('should allow setting SVG width/height through metadata', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadSVG);

        const texture: Texture = await loader.load({
            data: {
                resourceOptions: {
                    width: 128,
                    height: 256,
                }
            },
            src: `${serverPath}svg/logo.svg`,
        });

        const { width, height } = texture.baseTexture;

        expect(width).toEqual(128);
        expect(height).toEqual(256);
    });

    it('should load a single image one after multiple loads', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const texturesPromises = [];

        for (let i = 0; i < 10; i++)
        {
            texturesPromises.push(loader.load(`${serverPath}textures/bunny.png`));
        }

        const textures = await Promise.all(texturesPromises);

        const ogTexture = textures[0];

        textures.forEach((texture) =>
        {
            expect(texture).toBe(ogTexture);
        });
    });

    it('should load multiple images', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const assetsUrls = [`${serverPath}textures/bunny.png`, `${serverPath}textures/bunny-2.png`];

        const textures = await loader.load(assetsUrls);

        expect(textures[`${serverPath}textures/bunny.png`]).toBeInstanceOf(Texture);
        expect(textures[`${serverPath}textures/bunny-2.png`]).toBeInstanceOf(Texture);
    });

    it('should load json file', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadJson);

        const json = await loader.load(`${serverPath}json/test.json`);

        expect(json).toEqual({
            testNumber: 23,
            testString: 'Test String 23',
        });
    });

    it('should load a spritesheet', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadJson, loadTextures, loadSpritesheet);

        const spriteSheet: Spritesheet = await loader.load(`${serverPath}spritesheet/spritesheet.json`);

        const bunnyTexture = spriteSheet.textures['bunny.png'];
        const senseiTexture = spriteSheet.textures['pic-sensei.jpg'];

        expect(bunnyTexture).toBeInstanceOf(Texture);
        expect(senseiTexture).toBeInstanceOf(Texture);

        expect(bunnyTexture.baseTexture).toBe(senseiTexture.baseTexture);

        expect(bunnyTexture.baseTexture.valid).toBe(true);
        expect(bunnyTexture.width).toBe(7);
        expect(bunnyTexture.height).toBe(10);

        expect(senseiTexture.baseTexture.valid).toBe(true);
        expect(senseiTexture.width).toBe(125);
        expect(senseiTexture.height).toBe(125);
    });

    it('should load a multi packed spritesheet', async () =>
    {
        const loader = new Loader();

        Cache['_parsers'].push(cacheSpritesheet);

        loader['_parsers'].push(loadJson, loadTextures, loadSpritesheet);

        const spritesheet = await loader.load(`${serverPath}spritesheet/multi-pack-0.json`) as Spritesheet;

        Cache.set('spritesheet/multi-pack-0.json', spritesheet);

        const pack0 = Cache.get('star1.png');
        const pack1 = Cache.get('goldmine_10_5.png');

        expect(pack0).toBeInstanceOf(Texture);
        expect(pack1).toBeInstanceOf(Texture);

        expect(pack0.baseTexture.valid).toBe(true);
        expect(pack0.width).toBe(64);
        expect(pack0.height).toBe(64);

        expect(pack1.baseTexture.valid).toBe(true);
        expect(pack1.width).toBe(190);
        expect(pack1.height).toBe(229);
    });

    it('should load a bitmap font', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures, loadBitmapFont);

        const bitmapFont: BitmapFont = await loader.load(`${serverPath}bitmap-font/desyrel.xml`);
        const bitmapFont2: BitmapFont = await loader.load(`${serverPath}bitmap-font/font.fnt`);

        expect(bitmapFont).toBeInstanceOf(BitmapFont);
        expect(bitmapFont2).toBeInstanceOf(BitmapFont);
    });

    it('should load a bitmap font text file', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTxt, loadTextures, loadBitmapFont);

        const bitmapFont: BitmapFont = await loader.load(`${serverPath}bitmap-font/bmtxt-test.txt`);

        expect(bitmapFont).toBeInstanceOf(BitmapFont);
    });

    it('should load a bitmap font sdf / msdf', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures, loadBitmapFont);

        const bitmapFont: BitmapFont = await loader.load(`${serverPath}bitmap-font/msdf.fnt`);
        const bitmapFont2: BitmapFont = await loader.load(`${serverPath}bitmap-font/sdf.fnt`);

        expect(bitmapFont).toBeInstanceOf(BitmapFont);
        expect(bitmapFont2).toBeInstanceOf(BitmapFont);
        expect(bitmapFont.distanceFieldType).toEqual('msdf');
        expect(bitmapFont2.distanceFieldType).toEqual('sdf');
    });

    it('should load a split bitmap font', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures, loadBitmapFont);

        const bitmapFont: BitmapFont = await loader.load(`${serverPath}bitmap-font/split_font.fnt`);

        expect(bitmapFont).toBeInstanceOf(BitmapFont);
    });

    it('should load a web font', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadWebFont);

        const font = await loader.load(`${serverPath}fonts/outfit.woff2`);

        let foundFont = false;

        document.fonts.forEach((f: FontFace) =>
        {
            if (f.family === 'Outfit')
            {
                foundFont = true;
            }
        });

        document.fonts.delete(font);

        expect(foundFont).toBe(true);
    });

    it('should load a web font with custom attributes', async () =>
    {
        const loader = new Loader();

        document.fonts.clear();
        loader['_parsers'].push(loadWebFont);

        const font = await loader.load({
            data: {
                family: 'Overridden',
                style: 'italic',
                weights: ['normal'],
            },
            src: `${serverPath}fonts/outfit.woff2`,
        });

        let count = 0;

        document.fonts.forEach((f: FontFace) =>
        {
            count++;
            expect(f.family).toBe('Overridden');
            expect(f.weight).toBe('normal');
            expect(f.style).toBe('italic');
        });

        document.fonts.delete(font);

        expect(count).toBe(1);
    });

    it('should load with metaData', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push({
            test: () => true,
            load: async (url, options) =>
                url + options.data.whatever,
        } as LoaderParser<string>);

        const sillyID: string = await loader.load({
            src: `${serverPath}textures/bunny.png`,
            data: { whatever: 23 },
        });

        expect(sillyID).toBe(`${serverPath}textures/bunny.png23`);
    });

    it('should unload a texture', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const texture: Texture = await loader.load(`${serverPath}textures/bunny.png`);

        expect(texture.baseTexture.destroyed).toBe(false);

        const baseTexture =  texture.baseTexture;

        await loader.unload(`${serverPath}textures/bunny.png`);

        expect(texture.baseTexture).toBe(null);
        expect(baseTexture.destroyed).toBe(true);
    });

    it('should unload a spritesheet', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadJson, loadTextures, loadSpritesheet);

        const spriteSheet: Spritesheet = await loader.load(`${serverPath}spritesheet/spritesheet.json`);

        await loader.unload(`${serverPath}spritesheet/spritesheet.json`);

        expect(spriteSheet.baseTexture).toBe(null);
    });

    it('should unload a bitmap font', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures, loadBitmapFont);

        const bitmapFont: BitmapFont = await loader.load(`${serverPath}bitmap-font/desyrel.xml`);

        expect(bitmapFont).toBeInstanceOf(BitmapFont);

        await loader.unload(`${serverPath}bitmap-font/desyrel.xml`);

        expect(bitmapFont.pageTextures).toBe(null);
    });

    it('should unload a web font', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadWebFont);

        await loader.load(`${serverPath}fonts/outfit.woff2`);

        await loader.unload(`${serverPath}fonts/outfit.woff2`);

        let foundFont = false;

        document.fonts.forEach((f: FontFace) =>
        {
            if (f.family === 'Outfit')
            {
                foundFont = true;
            }
        });

        expect(foundFont).toBe(false);
    });

    it('should split fonts if page IDs are in chronological order', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures, loadBitmapFont);

        const font = await loader.load(`${serverPath}bitmap-font/split_font2.fnt`);

        const charA = font.chars['A'.charCodeAt(0)];
        const charC = font.chars['C'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charA.page).toEqual(0);
        expect(charC.page).toEqual(1);
        expect(charATexture.baseTexture.resource.src).toEqual(`${serverPath}bitmap-font/split_font_ab.png`);
        expect(charCTexture.baseTexture.resource.src).toEqual(`${serverPath}bitmap-font/split_font_cd.png`);
    });
});