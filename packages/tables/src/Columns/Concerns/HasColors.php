<?php

namespace Filament\Tables\Columns\Concerns;

use Closure;

trait HasColors
{
    protected array $colors = [];

    public function colors(array $colors): static
    {
        $this->colors = $colors;

        return $this;
    }

    public function getStateColor(): ?string
    {
        $state = $this->getState();
        $stateColor = null;

        foreach ($this->getColors() as $color => $condition) {
            if (is_numeric($color)) {
                $stateColor = $condition;
            } elseif ($condition instanceof Closure && $condition($state)) {
                $stateColor = $color;
            } elseif ($condition === $state) {
                $stateColor = $color;
            }
        }

        return $stateColor;
    }

    public function getColors(): array
    {
        return $this->colors;
    }
}
