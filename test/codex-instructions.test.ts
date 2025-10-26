import { afterEach, describe, expect, it, vi } from 'vitest';

const originalFetch = global.fetch;

vi.mock('node:os', async () => ({
	default: {
		homedir: () => '/tmp/opencode-codex-test',
	},
	__esModule: true,
	homedir: () => '/tmp/opencode-codex-test',
}));

vi.mock('node:fs', async () => {
	const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
	return {
		...actual,
		existsSync: vi.fn(() => false),
		mkdirSync: vi.fn(),
		writeFileSync: vi.fn(),
	};
});

describe('getCodexInstructions', () => {
	afterEach(() => {
		vi.resetModules();
		vi.restoreAllMocks();

		if (originalFetch) {
			global.fetch = originalFetch;
		} else {
			// @ts-expect-error - fetch may be undefined in Node environments
			delete global.fetch;
		}
	});

	it('falls back to bundled instructions when GitHub fetch fails and no cache exists', async () => {
		const fetchMock = vi.fn().mockRejectedValue(new Error('network error'));
		// @ts-expect-error - runtime fetch global
		global.fetch = fetchMock;

		const { getCodexInstructions } = await import('../lib/prompts/codex.js');
		const instructions = await getCodexInstructions();

		expect(fetchMock).toHaveBeenCalled();
		expect(instructions).toContain('You are Codex, based on GPT-5.');
	});
});
