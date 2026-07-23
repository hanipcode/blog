---
title: Menyiapkan development OpenGL di macOS dengan C++ dan CMake
description: tidak semudah kelihatannya
publishedAt: '2025-09-24T17:37:16.127Z'
locale: id
translationKey: setting-up-opengl-development-on
tags:
  - C++
  - OpenGL
  - macOS
draft: false
canonicalUrl: 'https://hanipcode.substack.com/p/setting-up-opengl-development-on'
originalLocale: en
sourceHash: b40f3de44511ee44
---
hari ini saya ingin mulai belajar pemrograman grafis.

Hampir semua tutorial yang bisa saya temukan menyiapkannya menggunakan Visual Studio di Windows. Sementara environment development yang biasa saya gunakan ada di Mac.

Yah, masuk akal juga sih, karena entah kenapa Apple menghentikan dukungan OpenGL demi API grafis mereka, Metal. (nggak terlalu kaget, Apple memang begitu)

Saya sempat mencoba menyiapkan alur development di laptop Windows saya. tapi ya ampun, saya benar-benar nggak bisa produktif sama sekali. ini bukan salah OS-nya. lebih karena saya sudah banyak mengutak-atik Mac agar sesuai kebutuhan saya. satu contoh saja, saya belum memasang tiling window manager di Windows, dan remap keyboard saya juga nggak ada! jadi.. saya menyerah.

Untungnya, Apple tidak sepenuhnya menghentikan dukungan OpenGL, mereka hanya tidak mendukung versi OpenGL yang lebih baru (yang setahu saya saat ini versi 4.6), tapi saya masih bisa menggunakan OpenGL versi lama yang sebenarnya sudah terpasang di macOS.

karena saat ini saya masih dalam tahap belajar, saya rasa menggunakan versi lama masih nggak masalah.  
  
sekarang mari kita siapkan.

# Install GLFW

```bash
brew install glfw
```

# Struktur project

```text
opengl-macos-cmake/
├─ CMakeLists.txt
├─ external/
│  └─ glad/
│     ├─ include/
│     │  └─ glad/…         # headers (you’ll paste here)
│     └─ src/
│        └─ glad.c         # single C source (you’ll paste here)
└─ src/
   └─ main.cpp
```

# Dapatkan File Glad

pertama, kunjungi https://glad.dav1d.de/

lalu pastikan konfigurasinya terlihat seperti di bawah ini

![](https://substackcdn.com/image/fetch/$s_!Ki98!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8cfea197-677b-4784-9c1e-cf3812c93796_2124x1466.png)

lalu klik generate di bagian bawah.

setelah itu, kita download file glad.zip, lalu ekstrak dan tempatkan file-filenya seperti di bawah ini

-   salin include/glad/ ke external/glad/include/glad/ di project
    
-   salin src/glad.c ke external/glad/src/glad.c di project
    

# File CMakeList

```cmake
cmake_minimum_required(VERSION 3.20)
project(opengl_glfw_macos LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# If you use Apple Silicon, this is usually detected automatically.
# You can force a build arch if needed:
# set(CMAKE_OSX_ARCHITECTURES “arm64”)  # or “x86_64”

# Add GLAD (vendored)
add_library(glad vendor/glad/src/glad.c)
target_include_directories(glad PUBLIC vendor/glad/include)

# Find GLFW installed via Homebrew
# brew installs a CMake config, so this should work:
find_package(glfw3 REQUIRED)

# OpenGL on macOS
find_package(OpenGL REQUIRED)

add_executable(app src/main.cpp)

target_link_libraries(app
  PRIVATE
    glad
    glfw
    OpenGL::GL
    “-framework Cocoa”
    “-framework IOKit”
    “-framework CoreVideo”
)

# Nice warnings
if (CMAKE_CXX_COMPILER_ID MATCHES “Clang|AppleClang|GNU”)
  target_compile_options(app PRIVATE -Wall -Wextra -Wpedantic)
endif()
```

# File Main.cpp

```cpp
// clang-format off
#include <glad/glad.h>
#include <GLFW/glfw3.h>
// clang-format on
#include <iostream>

static void framebufferSizeCallback(GLFWwindow *window, int width, int height) {
  glViewport(0, 0, width, height);
}

static void glfw_error(int code, const char *desc) {
  std::cerr << “GLFW error “ << code << “: “ << desc << “\n”;
}

int main() {
  glfwSetErrorCallback(glfw_error);
  if (!glfwInit()) {
    std::cerr << “Failed to init GLFW \n”;
    return -1;
  }

  glfwWindowHint(GLFW_CLIENT_API, GLFW_OPENGL_API);

  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

#ifdef __APPLE__
  glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif
  GLFWwindow *window = glfwCreateWindow(800, 600, “MyOpenGL”, nullptr, nullptr);
  if (!window) {
    std::cerr << “Failed to create GLFW window \n”;
    glfwTerminate();
    return -1;
  }

  glfwMakeContextCurrent(window);

  if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
    std::cerr << “Failed to initialize GLAD\n”;
    return -1;
  }

  int fbW, fbH;
  glfwGetFramebufferSize(window, &fbW, &fbH);
  glViewport(0, 0, fbW, fbH);
  glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);

  while (!glfwWindowShouldClose(window)) {
    glClearColor(0.1f, 0.12f, 0.15f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);
    glfwSwapBuffers(window);
    glfwPollEvents();
  }

  glfwDestroyWindow(window);
  glfwTerminate();
}
```

# Konfigurasi dan build

```text
# Configure (Unix Makefiles)
cmake -S . -B build

# Or generate an Xcode project if you prefer
# cmake -S . -B build -G Xcode

# Build
cmake --build build --config Release

# Run (Makefiles)
./build/app
```

# Beberapa Catatan

sekarang kita seharusnya sudah bisa menjalankannya.

kalian mungkin menyadari

```cpp
#ifdef __APPLE__
  glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif
```

ini sebenarnya untuk memastikan driver diperintahkan menghapus semua fungsionalitas OpenGL yang sudah deprecated.

dan juga ini

```cmake
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
```

baris ini untuk memastikan file compile\_commands.json dibuat, saya sendiri kurang yakin, tapi ini membantu code editor kita. sebelum file tersebut dihasilkan, ada error linter di neovim saya. tapi setelah file-nya dihasilkan dan menjalankan

```bash
ln -s build/compile_commands.json .
```

error linter-nya sekarang hilang. Sepertinya ini membantu clangd (LSP C++) menautkan file vendor/include kita dengan benar.

Yah, ternyata cukup banyak juga hanya untuk memunculkan sebuah window yang bahkan belum melakukan apa-apa. Sepertinya inilah pengalaman menggunakan C++!
