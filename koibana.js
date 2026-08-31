const SUPABASE_URL = "https://fjcxxzuvklzojzdqfanl.supabase.co";

const SUPABASE_KEY = "sb_publishable_8LDhmLYYfh8pkmsagbXz0A_BL8JdyQI";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==================================================
// 管理者設定
// ==================================================

const ADMIN_EMAIL = "sora527brave@gmail.com";


// ==================================================
// HTML要素
// ==================================================

const adminLoginArea =
    document.querySelector("#admin-login");

const adminEmailInput =
    document.querySelector("#admin-email");

const adminPasswordInput =
    document.querySelector("#admin-password");

const adminLoginButton =
    document.querySelector("#admin-login-button");

const adminLogoutButton =
    document.querySelector("#admin-logout-button");

const adminStatus =
    document.querySelector("#admin-status");

const postsArea =
    document.querySelector("#posts");

const postButton =
    document.querySelector("#post-button");


// ==================================================
// ?admin のときだけ管理者ログイン欄を表示
// ==================================================

const urlParams =
    new URLSearchParams(window.location.search);

const isAdminPage =
    urlParams.has("admin");


if (adminLoginArea) {

    if (isAdminPage) {

        adminLoginArea.style.display = "block";

    } else {

        adminLoginArea.style.display = "none";

    }

}


// ==================================================
// 現在ログインしているユーザーを取得
// ==================================================

async function getCurrentUser() {

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error) {

        console.error("ユーザー取得エラー:", error);

        return null;

    }

    return data.user;

}


// ==================================================
// 管理者かどうか確認
// ==================================================

async function isAdmin() {

    const user =
        await getCurrentUser();

    if (!user || !user.email) {

        return false;

    }

    return (
        user.email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
    );

}


// ==================================================
// 管理者ログイン
// ==================================================

async function adminLogin() {

    if (!adminEmailInput || !adminPasswordInput) {

        return;

    }


    const email =
        adminEmailInput.value.trim();

    const password =
        adminPasswordInput.value;


    if (!email || !password) {

        alert(
            "メールアドレスとパスワードを入力してください。"
        );

        return;

    }


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        console.error("ログインエラー:", error);

        alert(
            "ログインできませんでした。"
        );

        return;

    }


    // ==================================================
    // 管理者メールアドレスを確認
    // ==================================================

    if (
        !data.user ||
        !data.user.email ||
        data.user.email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        await supabaseClient.auth.signOut();

        alert(
            "このアカウントには管理者権限がありません。"
        );

        return;

    }


    // ==================================================
    // ログイン成功
    // ==================================================

    if (adminStatus) {

        adminStatus.textContent =
            "管理者としてログイン中";

    }


    if (adminEmailInput) {

        adminEmailInput.style.display = "none";

    }


    if (adminPasswordInput) {

        adminPasswordInput.style.display = "none";

    }


    if (adminLoginButton) {

        adminLoginButton.style.display = "none";

    }


    if (adminLogoutButton) {

        adminLogoutButton.style.display = "inline-block";

    }


    // 投稿一覧を更新
    // 管理者なので削除ボタンが表示される

    await loadPosts();

}


// ==================================================
// ログアウト
// ==================================================

async function adminLogout() {

    await supabaseClient.auth.signOut();


    if (adminStatus) {

        adminStatus.textContent = "";

    }


    if (adminEmailInput) {

        adminEmailInput.value = "";

        adminEmailInput.style.display = "block";

    }


    if (adminPasswordInput) {

        adminPasswordInput.value = "";

        adminPasswordInput.style.display = "block";

    }


    if (adminLoginButton) {

        adminLoginButton.style.display = "inline-block";

    }


    if (adminLogoutButton) {

        adminLogoutButton.style.display = "none";

    }


    // 投稿一覧を更新
    // これで削除ボタンも消える

    await loadPosts();

}


// ==================================================
// 投稿を読み込む
// ==================================================

async function loadPosts() {

    if (!postsArea) {

        return;

    }


    postsArea.textContent =
        "読み込み中...";


    const { data, error } =
        await supabaseClient
            .from("posts")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        postsArea.textContent =
            "投稿を読み込めませんでした。";

        console.error("投稿読み込みエラー:", error);

        return;

    }


    postsArea.innerHTML = "";


    // ==================================================
    // 管理者か確認
    // ==================================================

    const admin =
        await isAdmin();


    // ==================================================
    // 投稿がない場合
    // ==================================================

    if (!data || data.length === 0) {

        postsArea.textContent =
            "まだ投稿はありません。";

        return;

    }


    // ==================================================
    // 投稿を表示
    // ==================================================

    data.forEach(post => {

        const postElement =
            document.createElement("article");


        // ==================================================
        // 日付
        // ==================================================

        const date =
            new Date(post.created_at);


        // ==================================================
        // 名前
        // ==================================================

        const name =
            escapeHtml(
                post.name || "匿名"
            );


        // ==================================================
        // 本文
        // ==================================================

        const content =
            escapeHtml(
                post.content || ""
            );


        // ==================================================
        // 投稿本文
        // ==================================================

        postElement.innerHTML = `
            <p>${name}</p>

            <p>
                ${date.toLocaleDateString("ja-JP")}
            </p>

            <p>${content}</p>
        `;


        // ==================================================
        // 管理者の場合だけ削除ボタンを作る
        // ==================================================

        if (admin) {

            const deleteButton =
                document.createElement("button");


            deleteButton.className =
                "delete-button";


            deleteButton.textContent =
                "削除";


            deleteButton.type =
                "button";


            deleteButton.addEventListener(
                "click",
                function () {

                    deletePost(post.id);

                }
            );


            postElement.appendChild(
                deleteButton
            );

        }


        postsArea.appendChild(
            postElement
        );

    });

}


// ==================================================
// 投稿する
// ==================================================

async function createPost() {

    const nameInput =
        document.querySelector("#name");

    const contentInput =
        document.querySelector("#content");


    if (!nameInput || !contentInput) {

        return;

    }


    const name =
        nameInput.value.trim();

    const content =
        contentInput.value.trim();


    if (!content) {

        alert(
            "恋バナを書いてください。"
        );

        return;

    }


    const { error } =
        await supabaseClient
            .from("posts")
            .insert({

                name:
                    name || "匿名",

                content:
                    content

            });


    if (error) {

        console.error("投稿エラー:", error);

        alert(
            "投稿できませんでした。"
        );

        return;

    }


    // 入力欄を空にする

    nameInput.value = "";

    contentInput.value = "";


    // 投稿一覧を更新

    await loadPosts();

}


// ==================================================
// 投稿を削除する
// ==================================================

async function deletePost(postId) {

    // ==================================================
    // 管理者か確認
    // ==================================================

    const admin =
        await isAdmin();


    if (!admin) {

        alert(
            "管理者だけが削除できます。"
        );

        return;

    }


    // ==================================================
    // 削除確認
    // ==================================================

    const confirmed =
        confirm(
            "この投稿を削除しますか？"
        );


    if (!confirmed) {

        return;

    }


    // ==================================================
    // Supabaseから削除
    // ==================================================

    const { error } =
        await supabaseClient
            .from("posts")
            .delete()
            .eq(
                "id",
                postId
            );


    if (error) {

        console.error("削除エラー:", error);

        alert(
            "投稿を削除できませんでした。"
        );

        return;

    }


    // ==================================================
    // 削除成功
    // ==================================================

    alert(
        "投稿を削除しました。"
    );


    // 投稿一覧を更新

    await loadPosts();

}


// ==================================================
// HTMLエスケープ
// ==================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ==================================================
// 投稿ボタン
// ==================================================

if (postButton) {

    postButton.addEventListener(
        "click",
        createPost
    );

}


// ==================================================
// 管理者ログインボタン
// ==================================================

if (adminLoginButton) {

    adminLoginButton.addEventListener(
        "click",
        adminLogin
    );

}


// ==================================================
// 管理者ログアウトボタン
// ==================================================

if (adminLogoutButton) {

    adminLogoutButton.addEventListener(
        "click",
        adminLogout
    );

}


// ==================================================
// 初期化
// ==================================================

async function initialize() {

    // ==================================================
    // 現在のログイン状態を確認
    // ==================================================

    const user =
        await getCurrentUser();


    // ==================================================
    // すでに管理者としてログインしている場合
    // ==================================================

    if (
        user &&
        user.email &&
        user.email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
    ) {

        if (adminStatus) {

            adminStatus.textContent =
                "管理者としてログイン中";

        }


        if (adminEmailInput) {

            adminEmailInput.style.display =
                "none";

        }


        if (adminPasswordInput) {

            adminPasswordInput.style.display =
                "none";

        }


        if (adminLoginButton) {

            adminLoginButton.style.display =
                "none";

        }


        if (adminLogoutButton) {

            adminLogoutButton.style.display =
                "inline-block";

        }

    }


    // ==================================================
    // 投稿を読み込む
    // ==================================================

    await loadPosts();

}


// ==================================================
// 開始
// ==================================================

initialize();