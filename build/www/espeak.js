let speak = {
    play: () => { },
};
let e;

function espeakFetch(arr) {
    return arr.map((url) => {
        return fetch(`/espeak-ng-data/${url}`)
            .then(data => data.arrayBuffer())
            .then(data => new Uint8Array(data))
    });
}

function timestamps() {
    return {
        timestamps: {
            access: new Date(),
            change: new Date(),
            modification: new Date(),
        },
    };
}
function removePlusBrackets(str) {
    return str.replace(/\+\[.*?\]/g, '');
}
{
    async function main() {
        let speakNgBuffer = await fetch("/speak-ng.wasm").then((res) => res.arrayBuffer());
        let { WASI } = await import("/lib/runno.js");
        async function play(text, options = {}, onend = () => {}, onstart = () => {}, signal = { addEventListener() {} }) {
            let [
                phontab,
                phondata,
                phonindex,
                intonations,
                en_dict,
                en_US,
                dict,
            ] = await Promise.all(espeakFetch([
                "phontab",
                "phondata",
                "phonindex",
                "intonations",
                "en_dict",
                "lang/"+String(options.voice || "en-US"),
                String(options.voice || "en")+"_dict",
            ]));
            let stopped = false;
            signal.addEventListener("abort", () => stopped = true);
            let wasi = new WASI({
                args: [
                    "speak-ng",
                    "-w", "wav.wav",
                    "-v", String(options.voice || "en-us"),
                    "-p", String(options.pitch || 50),
                    "-s", String(options.speed || 175),
                    "--path=/espeak",
                    "--",
                    text,
                ],
                stdout: console.log,
                stderr: console.error,
                fs: {
                    ["/espeak/en_dict"]: {
                        path: "/espeak/en_dict",
                        ...timestamps(),
                        mode: "binary",
                        content: en_dict,
                    },
                    "/espeak/phontab": {
                        path: "/espeak/phontab",
                        ...timestamps(),
                        mode: "binary",
                        content: phontab,
                    },
                    "/espeak/phondata": {
                        path: "/espeak/phondata",
                        ...timestamps(),
                        mode: "binary",
                        content: phondata,
                    },
                    "/espeak/phonindex": {
                        path: "/espeak/phonindex",
                        ...timestamps(),
                        mode: "binary",
                        content: phonindex,
                    },
                    "/espeak/intonations": {
                        path: "/espeak/intonations",
                        ...timestamps(),
                        mode: "binary",
                        content: intonations,
                    },
                    ["/espeak/"+String(options.voice || "en")+"_dict"]: {
                        path: "/espeak/"+String(options.voice || "en")+"_dict",
                        ...timestamps(),
                        mode: "binary",
                        content: dict,
                    },
                    ["/espeak/lang/"+String(options.voice || "en-US")]: {
                        path: "/espeak/lang/"+String(options.voice || "en-US"),
                        ...timestamps(),
                        mode: "binary",
                        content: en_US,
                    },
                },
            }); 
            let wasm = await WebAssembly.instantiate(speakNgBuffer, {
                ...wasi.getImportObject(),
            });
            await wasi.start(wasm);
            if (stopped) return;
            let audioCtx = new AudioContext();
            let buffer = await audioCtx.decodeAudioData(wasi.drive.fs["/wav.wav"].content.buffer);
            let source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start();
            onstart(source);
            source.addEventListener("ended", () => {
                onend();
            })
            return wasi;
        }
        speak.play = play;
    }
    main();
}