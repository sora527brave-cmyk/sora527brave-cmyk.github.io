const SUPABASE_URL = "https://fjcxxzuvklzojzdqfanl.supabase.co";
const SUPABASE_KEY = "sb_publishable_8LDhmLYYfh8pkmsagbXz0A_BL8JdyQI";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// 投稿を読み込む
async function loadPosts() {

    const { data, error } = await supabaseClient
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    const postsArea = document.querySelector("#posts");

    if (error) {
        postsArea.textContent = "投稿を読み込めませんでした。";
        console.error(error);
        return;
    }

    postsArea.innerHTML = "";

    data.forEach(post => {

        const postElement = document.createElement("article");

        const date = new Date(post.created_at);

        postElement.innerHTML = `
            <p>${escapeHtml(post.name || "匿名")}</p>
            <p>${date.toLocaleDateString("ja-JP")}</p>
            <p>${escapeHtml(post.content)}</p>
            <hr>
        `;

        postsArea.appendChild(postElement);
    });
}


// 投稿する
async function createPost() {

    const name = document.querySelector("#name").value.trim();
    const content = document.querySelector("#content").value.trim();

    if (!content) {
        alert("恋バナを書いてください。");
        return;
    }

    const { error } = await supabaseClient
        .from("posts")
        .insert({
            name: name || "匿名",
            content: content
        });

    if (error) {
        alert("投稿できませんでした。");
        console.error(error);
        return;
    }

    document.querySelector("#name").value = "";
    document.querySelector("#content").value = "";

    loadPosts();
}


// HTMLとして解釈されないようにする
function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


document
    .querySelector("#post-button")
    .addEventListener("click", createPost);


loadPosts();