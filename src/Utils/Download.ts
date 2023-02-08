
export function getFullDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return `${year}-${month}-${day}-${hour}-${min}-${sec}`;
}

export function textToFile(text: string|string[]): File {
    return new File(Array.isArray(text) ? text : [text],"file.txt");
}

export function download(data: Blob | string, downloadName = 'download') {
    // using ideas from https://github.com/eligrey/FileSaver.js/blob/master/FileSaver.js

    if (!data) return;

    if ('download' in HTMLAnchorElement.prototype) {
        const a = document.createElement('a');
        a.download = downloadName;
        a.rel = 'noopener';

        if (typeof data === 'string') {
            a.href = data;
            click(a);
        } else {
            a.href = URL.createObjectURL(data);
            setTimeout(() => URL.revokeObjectURL(a.href), 4E4); // 40s
            setTimeout(() => click(a));
        }
    } else if (typeof navigator !== 'undefined' && (navigator as any).msSaveOrOpenBlob) {
        // native saveAs in IE 10+
        (navigator as any).msSaveOrOpenBlob(data, downloadName);
    } else {
        const ua = window.navigator.userAgent;
        const isSafari = /Safari/i.test(ua);
        const isChromeIos = /CriOS\/[\d]+/.test(ua);

        const open = (str: string) => {
            openUrl(isChromeIos ? str : str.replace(/^data:[^;]*;/, 'data:attachment/file;'));
        };

        if ((isSafari || isChromeIos) && FileReader) {
            if (data instanceof Blob) {
                // no downloading of blob urls in Safari
                const reader = new FileReader();
                reader.onloadend = () => open(reader.result as string);
                reader.readAsDataURL(data);
            } else {
                open(data);
            }
        } else {
            const url = URL.createObjectURL(typeof data === 'string' ? new Blob([data]) : data);
            location.href = url;
            setTimeout(() => URL.revokeObjectURL(url), 4E4); // 40s
        }
    }
}

function openUrl(url: string) {
    const opened = window.open(url, '_blank');
    if (!opened) {
        window.location.href = url;
    }
}

function click(node: HTMLAnchorElement) {
    try {
        node.dispatchEvent(new MouseEvent('click'));
    } catch (e) {
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
        node.dispatchEvent(evt);
    }
}