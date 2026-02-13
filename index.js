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

import { $, argv, stdin, os } from "zx";
// import { spawn } from "node:child_process";

$.stdio = "inherit";

const delimiter = argv.delimiter || "\n";
const replace = argv.replace || null;
const parallel = argv.parallel || false;

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

// 実行する関数
async function runCommand(tok) {
	const args2 = replace
		? cmdTemplateArgs.map((a) => a.replaceAll(replace, tok))
		: [...cmdTemplateArgs, tok];

	try {
		const result = await $`${cmd} ${args2}`;
		return result.exitCode ?? 0;
	} catch (err) {
		console.error(err.stderr ?? err.message);
		return err.exitCode ?? 1;
	}
}

let exitCodes = [];

if (parallel) {
	// 並列実行
	const concurrency = os.cpus().length;
	const queue = [...tokens];
	const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
		while (queue.length > 0) {
			const tok = queue.shift();
			const code = await runCommand(tok);
			exitCodes.push(code);
		}
	});
	await Promise.all(workers);
} else {
	// 逐次実行
	for (const tok of tokens) {
		const code = await runCommand(tok);
		exitCodes.push(code);
	}
}

// いずれかのコマンドが失敗した場合は、終了コード 1 を返す
const failed = exitCodes.some((code) => code !== 0);
process.exit(failed ? 1 : 0);
