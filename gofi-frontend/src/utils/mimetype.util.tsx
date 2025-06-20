/**
 * 用于处理文件mime-type相关的函数集合
 */
import React from 'react'
import {
    AiOutlineFile,
    AiOutlineFileExcel,
    AiOutlineFileGif,
    AiOutlineFileImage,
    AiOutlineFileJpg,
    AiOutlineFileMarkdown,
    AiOutlineFilePdf,
    AiOutlineFilePpt,
    AiOutlineFileText,
    AiOutlineFileWord,
    AiOutlineFileZip,
} from 'react-icons/ai'
import {
    DiCss3,
    DiGit,
    DiGo,
    DiHtml5,
    DiJava,
    DiJavascript,
    DiPhp,
    DiPython,
    DiRust,
    DiSwift,
    DiTerminal,
} from 'react-icons/di'
import { MdLibraryMusic } from 'react-icons/md'
import { RiFilmLine } from 'react-icons/ri'

export type PreviewableFileType = 'image' | 'pdf' | 'video' | 'text' | 'audio'

const PreviewableFileTypeMap: Record<PreviewableFileType, string[]> = {
    image: ['gif', 'jpg', 'jpeg', 'png', 'svg', 'webp', 'tiff', 'ico', 'bmp', 'avif', 'apng'],
    pdf: ['pdf'],
    video: ['webm', 'mkv', 'flv', 'vob', 'ogv', 'ogg', 'drc', 'mng', 'avi', 'mts', 'm2ts', 'ts', 'mov', 'qt', 'wmv', 'yuv', 'rm', 'rmvb', 'viv', 'asf', 'amv', 'mp4', 'm4p', 'm4v', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'm2v', 'svi', '3gp', '3g2', 'mxf', 'roq', 'nsv', 'f4v', 'f4p', 'f4a', 'f4b'],
    audio: ['3gp', 'aa', 'aac', 'aax', 'act', 'aiff', 'alac', 'amr', 'ape', 'au', 'awb', 'dss', 'flac', 'gsm', 'm4a', 'm4b', 'm4p', 'mp3', 'mpc', 'ogg', 'oga', 'mogg', 'opus', 'ra', 'rm', 'raw', 'rf64', 'sln', 'tta', 'voc', 'vox', 'wav', 'wma', 'wv', 'webm', '8svx', 'cda'],
    text: ['log', 'iml', 'bat', 'properties', 'lock', 'plist', 'gradle', 'class', 'xcconfig', 'qml', 'js', 'ts', 'tsx', 'jsx', 'vue', 'javascript', 'java', 'swift', 'cs', 'php', 'py', 'cpp', 'cc', 'h', 'm', 'mm', 'c', 'go', 'sh', 'rs', 'css', 'html', 'xml', 'ini', 'yaml', 'toml', 'json', 'md', 'txt'],
}

const extensionIconMap: Record<string, React.ReactNode> = {
    md: <AiOutlineFileMarkdown />,
    'txt/xml/bat/properties/lock/plist/gradle/class/xcconfig/qml': <AiOutlineFileText />,
    gif: <AiOutlineFileGif />,
    'jpg/jeg': <AiOutlineFileJpg />,
    'png/svg/webp/tiff/ico/bmp/avif/apng': <AiOutlineFileImage />,
    'xls/xlsx/csv': <AiOutlineFileExcel />,
    'ppt/pptx': <AiOutlineFilePpt />,
    'doc/docx': <AiOutlineFileWord />,
    pdf: <AiOutlineFilePdf />,
    'zip/7z/rar/gz/xz/bz2/tar/tar.gz/tar.xz/tar/bz2': <AiOutlineFileZip />,
    'webm/mkv/flv/vob/ogv/ogg/drc/mng/avi/MTS/M2TS/TS/mov/qt/wmv/yuv/rm/rmvb/viv/asf/amv/mp4/m4p/m4v/mpg/mp2/mpeg/mpe/mpv/m2v/m4v/svi/3gp/3g2/mxf/roq/nsv/f4v/f4p/f4a/f4b':
        <RiFilmLine />,
    '3gp/aa/aac/aax/act/aiff/alac/amr/ape/au/awb/dss/flac/gsm/m4a/m4b/m4p/mp3/mpc/ogg/oga/mogg/opus/ra/rm/raw/rf64/sln/tta/voc/vox/wav/wma/wv/webm/8svx/cda':
        <MdLibraryMusic />,
    'js/javascript': <DiJavascript />,
    html: <DiHtml5 />,
    css: <DiCss3 />,
    git: <DiGit />,
    swift: <DiSwift />,
    java: <DiJava />,
    go: <DiGo />,
    php: <DiPhp />,
    py: <DiPython />,
    rs: <DiRust />,
    sh: <DiTerminal />,
}

const MimeTypeUtil = {
    /**
     * 根据文件扩展名,返回对应的图标
     * Returns the icon for the given extension
     * @param extension file suffix
     * @returns icon
     */
    icon(extension?: string): React.ReactNode {
        if (extension) {
            for (const mimeTypes in extensionIconMap) {
                let icon = extensionIconMap[mimeTypes]
                if (mimeTypes.toLocaleLowerCase().includes(extension.toLowerCase())) {
                    return icon
                }
            }
        }

        // default file icon
        return <AiOutlineFile />
    },
    /**
     * 根据文件扩展名返回对应的可预览类型
     * @param extension
     * @param mimetype
     * @param hasContent 是否有文件内容（后端判断为文本文件）
     * @returns
     */
    previewableTypeOf(extension?: string, mimetype: string = '', hasContent: boolean = false): PreviewableFileType | null {
        // 如果后端判断为文本文件（有content字段），直接返回text
        if (hasContent) {
            return 'text'
        }

        if (extension) {
            const lowerExt = extension.toLowerCase();
            for (const fileType in PreviewableFileTypeMap) {
                const extensions = PreviewableFileTypeMap[fileType as PreviewableFileType];
                if (extensions.includes(lowerExt)) {
                    return fileType as PreviewableFileType
                }
            }
        }

        // 基于 MIME 类型判断
        if (mimetype) {
            const mimeLower = mimetype.toLowerCase()
            
            // 文本类型
            if (mimeLower.startsWith('text/') || 
                mimeLower.includes('application/json') ||
                mimeLower.includes('application/xml') ||
                mimeLower.includes('application/javascript') ||
                mimeLower.includes('application/x-sh') ||
                mimeLower.includes('application/x-python') ||
                mimeLower.includes('application/x-httpd-php') ||
                mimeLower.includes('application/x-c') ||
                mimeLower.includes('application/x-c++') ||
                mimeLower.includes('application/x-java') ||
                mimeLower.includes('application/x-rust') ||
                mimeLower.includes('application/x-go') ||
                mimeLower.includes('application/x-yaml') ||
                mimeLower.includes('application/x-toml') ||
                mimeLower.includes('application/x-ini') ||
                mimeLower.includes('application/x-markdown')) {
                return 'text'
            }
            
            // 图片类型
            if (mimeLower.startsWith('image/')) {
                return 'image'
            }
            
            // 视频类型
            if (mimeLower.startsWith('video/')) {
                return 'video'
            }
            
            // 音频类型
            if (mimeLower.startsWith('audio/')) {
                return 'audio'
            }
            
            // PDF
            if (mimeLower === 'application/pdf') {
                return 'pdf'
            }
        }

        return null
    },
}

export default MimeTypeUtil
