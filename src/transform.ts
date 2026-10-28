const LATEX_PATTERN = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g;

export interface TransformOptions {
	excludedWords: string[];
}

function buildExclusionSet(excludedWords: string[]): Set<string> {
	const set = new Set<string>();
	for (const word of excludedWords) {
		const trimmed = word.trim();
		if (trimmed.length > 0) {
			set.add(trimmed);
		}
	}
	return set;
}

function capitalizeWord(word: string): string {
	for (let i = 0; i < word.length; i++) {
		const char = word[i];
		if (char && /[a-zA-Z]/.test(char)) {
			return word.slice(0, i) + char.toUpperCase() + word.slice(i + 1).toLowerCase();
		}
	}
	return word;
}

function transformSegment(segment: string, exclusions: Set<string>): string {
	return segment.replace(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu, (token) => {
		if (exclusions.has(token)) {
			return token;
		}
		return capitalizeWord(token);
	});
}

export function toCapitalizedCase(input: string, options: TransformOptions): string {
	const exclusions = buildExclusionSet(options.excludedWords);
	const parts = input.split(LATEX_PATTERN);

	return parts
		.map((part, index) => {
			if (index % 2 === 1) {
				return part;
			}
			return transformSegment(part, exclusions);
		})
		.join("");
}
