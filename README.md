# TOO-DESIGN｜美式成真

这是当前网站的完整静态代码和图片。无需安装 Node.js，也无需编译。

## 在电脑上查看

先把压缩包完整解压到一个文件夹，再双击 `index.html`，用浏览器打开。不要在压缩包内部直接打开，也不要只取出 HTML 文件。

这只是本地查看；要获得能发给客户的公开链接，请按下面步骤发布。

## 使用 GitHub Pages 发布

### 1. 创建仓库

登录 https://github.com/new ，仓库名填写 `too-design`，选择 **Public**，开启 **Add README**，再点击 **Create repository**。免费账号使用公开仓库；代码及图片也会公开。

### 2. 把仓库下载到电脑

安装 GitHub Desktop：https://desktop.github.com/ ，登录你的 GitHub 账号。

在 GitHub Desktop 中点击 **File → Clone repository**，选中刚建的 `too-design`，点击 **Clone**。如果列表没有出现它，切换到 **URL**，粘贴你的 GitHub 仓库链接。

### 3. 复制整套网站文件

在 GitHub Desktop 中点击 **Repository → Show in Explorer**，打开本地仓库文件夹。

把本压缩包解压后的全部内容复制进去。README 如有提示可以覆盖。正确结构是：

```text
too-design/
  index.html
  studio.css
  type-home.css
  motion.css
  studio.js
  motion.js
  portfolio-data.js
  .nojekyll
  README.md
  assets/
```

必须让 `index.html` 直接位于仓库第一层，不要在外面再套一层文件夹。保留整个 `assets` 目录及其内部结构。`.nojekyll` 是空文件，用来直接发布静态文件。

### 4. 上传

回到 GitHub Desktop，在左下角 **Summary** 填写 `Publish TOO-DESIGN website`，点击 **Commit to main**，然后点击顶部 **Push origin**。

### 5. 开启 Pages

回到 GitHub 网页上的仓库，打开 **Settings → Pages**：

- **Source**：选择 **Deploy from a branch**。
- **Branch**：选择 **main**。
- **Folder**：选择 **/(root)**。
- 点击 **Save**。

等待发布完成，在同一个 Pages 页面点击 **Visit site**。项目网址通常是 `https://你的GitHub用户名.github.io/too-design/`；以 Pages 页面显示的实际地址为准。

以后修改本地文件后，再次 **Commit → Push origin**，Pages 会更新网站。

## 如果使用 GitHub 网页直接上传

上传解压后的文件和目录，不要只上传 ZIP。网页上传每次最多 100 个文件、单文件最大 25 MiB；本包有 300 多个文件，因此需要分批，并保留相同目录结构。用 GitHub Desktop 可以省去这部分手动分批操作。

## 发布后确认

用电脑和手机分别打开公开链接，检查首页、各类作品及尾页，再用你的国内 Wi-Fi 和手机流量测试。GitHub Pages 尚未在你的网络环境中验证；更换托管不代表已经解决所有访问问题。

## 官方操作说明

- 创建并发布 Pages：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- 配置发布来源：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Desktop 克隆仓库：https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop
- Desktop 提交更改：https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop
- 网页上传限制：https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
