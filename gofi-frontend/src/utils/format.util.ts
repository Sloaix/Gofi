import { UserType } from '../constants/user'

export enum ByteFormat {
    /**
     * Use Base 10 (1 kB = 1000 bytes). Recommended for sizes of files on disk, disk sizes, bandwidth.
     */
    SI = 0,
    /**
     * Use Base 2 (1 KiB = 1024 bytes). Recommended for RAM size, size of files on disk.
     */
    IEC = 1,
}

export class FormatUtil {
    /**
     * Returns a human-readable representation of a quantity of bytes in the most reasonable unit of magnitude.
     * @example
     * formatBytes(0) // returns "0 bytes"
     * formatBytes(1) // returns "1 byte"
     * formatBytes(1024, ByteFormat.IEC) // returns "1 KiB"
     * formatBytes(1024, ByteFormat.SI) // returns "1.02 kB"
     * @param size The size in bytes.
     * @param format Format using SI (Base 10) or IEC (Base 2). Defaults to SI.
     * @returns A string describing the bytes in the most reasonable unit of magnitude.
     */
    static formatBytes(value: number, format: ByteFormat = ByteFormat.SI): string {
        const [multiple, k, suffix] = (format === ByteFormat.SI ? [1000, 'k', 'B'] : [1024, 'K', 'iB']) as [
            number,
            string,
            string,
        ]
        // tslint:disable-next-line: no-bitwise
        const exp = (Math.log(value) / Math.log(multiple)) | 0
        // or, if you'd prefer not to use bitwise expressions or disabling tslint rules, remove the line above and use the following:
        // const exp = value === 0 ? 0 : Math.floor(Math.log(value) / Math.log(multiple))
        const size = Number((value / Math.pow(multiple, exp)).toFixed(2))

        return size + ' ' + (exp ? (k + 'MGTPEZY')[exp - 1] + suffix : 'B')
    }

    /**
     *
     * @param timestamp from 1970 milliseconds
     * @returns yyyy-mm-dd hh:mm
     */
    static formatTime(timestamp: number): string {
        let date = new Date(timestamp),
            year = `${date.getFullYear()}`,
            month = `${date.getMonth() + 1}`,
            day = `${date.getDate()}`,
            houer = `${date.getHours()}`,
            minute = `${date.getMinutes()}`

        if (month.length < 2) {
            month = '0' + month
        }
        if (day.length < 2) {
            day = '0' + day
        }

        if (houer.length < 2) {
            houer = '0' + houer
        }

        if (minute.length < 2) {
            minute = '0' + minute
        }

        return `${[year, month, day].join('-')} ${[houer, minute].join(':')}`
    }

    static formatUserType(userType: number | undefined | null) {
        if (userType !== undefined && userType !== null) {
            switch (userType) {
                case UserType.ADMIN:
                    return '管理员'
                case UserType.USER:
                    return '用户'
            }
        }
        return '未知类型'
    }
}
