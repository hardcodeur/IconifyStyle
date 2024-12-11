<?php

namespace App\Service;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;


class IconsJson
{

    private $filesystem;
    private $slugger;
    private $temporaryDirectory;
    protected $jsonIcons = './iconsJson/heroicons.json';

    public function __construct(Filesystem $filesystem, SluggerInterface $slugger, string $temporaryDirectory)
    {
        $this->filesystem = $filesystem;
        $this->slugger = $slugger;
        $this->temporaryDirectory = $temporaryDirectory;
    }

    public function downloadIconsJson()
    {
        $jsonIconsData = file_get_contents($this->jsonIcons);
        $iconsData = json_decode($jsonIconsData, true);
        return $iconsData;
    }


    public function cssComplieur(array $downloadList, string $iconsStyle)
    {
        $svgList = $this->downloadIconsJson();
        $randInt = date("His");
        $filename = $this->slugger->slug("CSSHeroiconsPicker") . $randInt . "_" . $iconsStyle . '.css';
        $filepath = $this->temporaryDirectory . '/' . $filename;

        foreach ($downloadList as $iconslist) {

            $svgListKey = array_search($iconslist['id'], array_column($svgList, 'id'));
            $svgName = $svgList[$svgListKey]["name"];
            $svgPath = $svgList[$svgListKey]["svgPath"][$iconsStyle];

            $cssContent = "span." . $svgName . "{" . "\n";
            $cssContent .= "\t" . "content: url(" . "\n";
            if ($iconsStyle === "solid") {
                $cssContent .= "\t" . "\t" . "'data:image/svg+xml;utf8," . '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">';
            } elseif ($iconsStyle === "outline") {
                $cssContent .= "\t" . "\t" . "'data:image/svg+xml;utf8," . '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">';
            }
            foreach ($svgPath as $path) {
                $cssContent .= $path;
            }
            $cssContent .= "</svg>'" . "\n";
            $cssContent .= "\t" . ");" . "\n";
            $cssContent .= "}";
            $cssContent .= "\n";

            $this->filesystem->appendToFile($filepath, $cssContent);
        }


        $response = new Response();
        $response->setContent(file_get_contents($filepath));
        $response->headers->set('Content-Type', 'text/css');
        $response->headers->set('Content-Disposition', $response->headers->makeDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $filename));
        $this->filesystem->remove($filepath);
        return $response;
    }
}
