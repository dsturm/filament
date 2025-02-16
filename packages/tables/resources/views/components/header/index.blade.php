@props([
    'actions' => [],
    'description' => null,
    'heading',
])

<div {{ $attributes->class(['px-4 py-2']) }}>
    <div class="flex flex-col gap-4 md:items-center md:justify-between md:flex-row md:-mr-2">
        <div>
            @if ($heading)
                <x-tables::header.heading>
                    {{ $heading }}
                </x-tables::header.heading>
            @endif

            @if ($description)
                <x-tables::header.description>
                    {{ $description }}
                </x-tables::header.description>
            @endif
        </div>

        @if (count($actions))
            <x-tables::actions :actions="$actions" />
        @endif
    </div>
</div>
