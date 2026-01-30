#!/usr/bin/env node

// >> $ ls . | ./index.js -- echo
// >> $ echo "Hello world!" | ./index.js -- echo
// >> $ echo "1,2,3" | ./index.js --delimiter "," -- echo
// >> $ echo "apple,banana,cherry" | ./index.js --delimiter "," --replace "{}" -- echo "Fruit: {}"

// $.stdioにinheritを代入すれば、下記のspawnと同じ挙動になる。
/*
const child = spawn(cmd, args, { stdio: "inherit" });
*/
// >> 2025/10/09 14:14.

import { $, minimist, stdin } from "zx";
// import { spawn } from "node:child_process";

$.stdio = "inherit";

const args = minimist(process.argv.slice(2), {
	string: ["delimiter", "replace"],
	default: { delimiter: "\n", replace: null },
	"--": true,
});
// console.log(args);

if (args?.["--"]?.length === 0) {
	console.error("No command specified after --");
	process.exit(1);
}

const cmd = args?.["--"]?.[0];
const cmdTemplateArgs = args?.["--"]?.slice(1);

let input = "";
if (!process.stdin.isTTY) {
	input = await stdin();
}
// console.log(input);
// process.exit(0);

const tokens = input.split(args.delimiter).filter(Boolean);

if (!tokens.length) {
	process.exit(0);
}

let lastExit = 0;

for (const tok of tokens) {
	const args2 = args.replace
		? cmdTemplateArgs.map((a) => a.replaceAll(args.replace, tok))
		: [...cmdTemplateArgs, tok];
	// console.log(args2);

	try {
		const result = await $`${cmd} ${args2}`;
		lastExit = result.exitCode ?? 0;
	} catch (err) {
		console.error(err.stderr ?? err.message);
		lastExit = err.exitCode ?? 1;
	}
}

process.exit(lastExit);
