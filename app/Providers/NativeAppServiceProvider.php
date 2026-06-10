<?php

namespace App\Providers;

use Native\Desktop\Facades\Window;
use Native\Desktop\Contracts\ProvidesPhpIni;

class NativeAppServiceProvider implements ProvidesPhpIni
{
    /**
     * Executed once the native application has been booted.
     * Use this method to open windows, register global shortcuts, etc.
     */
    public function boot(): void
    {
        Window::open()
            ->title('Panda End')
            ->width(1280)
            ->height(800)
            ->minWidth(1024)
            ->minHeight(768)
            ->rememberState();
    }

    public function phpIni(): array
    {
        return [
            'upload_max_filesize' => '10240M',
            'post_max_size' => '10240M',
            'memory_limit' => '-1',
            'max_execution_time' => '0',
            'max_input_time' => '0',
        ];
    }
}
