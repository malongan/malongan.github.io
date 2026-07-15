from PIL import Image

# 打开背景和头像
bg = Image.open("hexo-blog/source/img/mountain-bg.jpg").convert("RGBA")
avatar = Image.open("/Users/qiqi/.qwenpaw/workspaces/feishu/media/7236250120c84184a6c8148b7bf0d520_image.png")

# 调整背景到 800x800
bg = bg.resize((800, 800), Image.LANCZOS)

# 调整头像大小为背景的 50%
avatar_size = 400
avatar = avatar.resize((avatar_size, avatar_size), Image.LANCZOS)

# 居中粘贴
x = (800 - avatar_size) // 2
y = (800 - avatar_size) // 2
bg.paste(avatar, (x, y), avatar)

# 保存为 PNG
bg.save("hexo-blog/source/img/avatar.png", "PNG")
print("done")
