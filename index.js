#!/usr/bin/env node

// >> $ ls . | ./index.js -- echo
// >> $ echo "Hello world!" | ./index.js -- echo
// >> $ echo "1,2,3" | ./index.js --delimiter "," -- echo
// >> $ echo "apple,banana,cherry" | ./index.js --delimiter "," --replace "{}" -- echo "Fruit: {}"

// 並列でコマンドを実行できるようにしたほうがいい。
// あとで--parallelのようなコマンドライン引数を実装する。
// >> 2026/01/30 15:32.

// $.stdioにinheritを代入すれば、下記のspawnと同じ挙動になる。
/*
const child = spawn(cmd, args, { stdio: "inherit" });
*/
// >> 2025/10/09 14:14.

import { $, argv, stdin } from "zx";
// import { spawn } from "node:child_process";

$.stdio = "inherit";

const delimiter = argv.delimiter || "\n";
const replace = argv.replace || null;

// -- 以降のコマンドと引数を手動で抽出する
const dashDashIndex = process.argv.indexOf("--");
const hasCommand = dashDashIndex !== -1 && dashDashIndex < process.argv.length - 1;

if (!hasCommand) {
	console.error("No command specified after --");
	process.exit(1);
}

const cmd = process.argv[dashDashIndex + 1];
const cmdTemplateArgs = process.argv.slice(dashDashIndex + 2);

let input = "";
if (!process.stdin.isTTY) {
	input = await stdin();
}
// console.log(input);
// process.exit(0);

const tokens = input.split(delimiter).filter(Boolean);

if (!tokens.length) {
	process.exit(0);
}

let lastExit = 0;

for (const tok of tokens) {
	const args2 = replace
		? cmdTemplateArgs.map((a) => a.replaceAll(replace, tok))
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
