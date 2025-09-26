/**
 * 密码校验规则
 * @param value 密码值
 * @param callback 回调函数
 */
export const validatePassword = (
    value: string,
    username: string,
    callback: (error?: Error) => void
) => {
    // 检查长度
    if (!username) {
        callback(new Error('请输入登录名'));
        return;
    }
    if (value.includes(username)) {
        callback(new Error('密码不能包含登录名'));
        return;
    }
    if (value.length < 8 || value.length > 20) {
        callback(new Error('密码长度必须在8-20个字符之间'));
        return;
    }

    // 检查是否包含数字、字母和特殊符号
    const hasNumber = /\d/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(value);
    if (!hasNumber || !hasLetter || !hasSpecial) {
        callback(new Error('密码必须包含数字、字母和特殊符号'));
        return;
    }

    // 检查键盘序列
    const keyboardSequences = [
        // 横向序列
        'qwertyuiop',
        'asdfghjkl',
        'zxcvbnm',
        '1234567890',
        // 纵向序列
        'qazwsxedcrfvtgbyhnujmikolp',
        '1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0p',
        // 数字键盘序列
        '789456123',
        '123456789',
        // 数字键盘斜向序列
        '741852963',
        '963852741',
        '741',
        '852',
        '963',
        '147',
        '258',
        '369'
    ];

    const lowerValue = value.toLowerCase();
    const sequences = keyboardSequences.flatMap((seq) => [
        seq,
        [...seq].reverse().join(''), // 倒序
        seq.toUpperCase(), // 大写
        [...seq].reverse().join('').toUpperCase() // 倒序大写
    ]);

    if (
        sequences.some((seq) => {
            // 检查是否包含3个或更多连续字符
            for (let i = 0; i <= seq.length - 3; i++) {
                const pattern = seq.slice(i, i + 3);
                if (lowerValue.includes(pattern.toLowerCase())) {
                    return true;
                }
            }
            return false;
        })
    ) {
        callback(new Error('密码不能使用键盘序列'));
        return;
    }

    // 检查连续重复字符
    if (/(.)\1{2,}/.test(value)) {
        callback(new Error('密码不能包含连续重复的字符'));
        return;
    }

    // 检查重复模式（增强版）
    const checkRepeatingPattern = (str: string) => {
        // 检查 AABB 模式
        if (/(.)\1(.)\2/.test(str)) {
            return true;
        }
        // 检查2-4个字符的重复模式
        for (let len = 2; len <= 4; len++) {
            for (let i = 0; i <= str.length - len * 2; i++) {
                const pattern = str.slice(i, i + len);
                const nextPart = str.slice(i + len, i + len * 2);
                if (pattern === nextPart) {
                    return true;
                }
            }
        }
        return false;
    };

    if (checkRepeatingPattern(value.toLowerCase())) {
        callback(new Error('密码不能包含重复的字符模式'));
        return;
    }

    // 检查常见数字组合（移到前面，优先检查）
    const commonNumbers = ['1314520', '520', '1314', '123456', '654321'];

    if (commonNumbers.some((num) => value.includes(num))) {
        callback(new Error('密码不能使用常见数字组合'));
        return;
    }

    // 检查常见单词替换
    const commonReplacements = [
        /p[a@]ssw[o0]rd/i,
        /[a@]dm[i1]n/i,
        /[u\u00fc]ser/i,
        /r[o0][o0]t/i,
        /h[e3][l1!][l1!][o0]/i,
        /52[O0][i1!]3[i1!]4/i,
        /[i1][l1][o0]ve[y]?[o0][u\u00fc]/i,
        /wo[a@][i1]n[i1]/i,
        /[i1][l1][o0]ve[u\u00fc]/i,
        /[l1][o0]ve[y]?[o0][u\u00fc]/i,
        /1314520/i,
        /520/i,
        /1314/i
    ];

    if (commonReplacements.some((regex) => regex.test(value))) {
        callback(new Error('密码不能使用常见单词、短语或数字的变体'));
        return;
    }

    // 检查简单的数字组合（扩展匹配模式）
    if (
        /^\d[@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]\d$/.test(value) ||
        /^\d{1,4}[@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]\d{1,4}$/.test(value)
    ) {
        callback(new Error('密码不能使用过于简单的数字特殊符号组合'));
        return;
    }

    // 检查连续数字序列
    const numericSequences = ['123', '321', '456', '654', '789', '987'];
    if (numericSequences.some((seq) => value.includes(seq))) {
        callback(new Error('密码不能包含连续的数字序列'));
        return;
    }

    // 检查日期格式
    if (/\d{4}([-/.]?\d{2}){2}/.test(value)) {
        callback(new Error('密码不能包含日期格式'));
        return;
    }

    // 检查邮箱格式
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(value)) {
        callback(new Error('密码不能包含邮箱格式'));
        return;
    }

    callback();
};
