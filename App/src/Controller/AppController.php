<?php

namespace App\Controller;


use App\Service\IconsJson;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class AppController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function home(): Response
    {
        return $this->render('app/home.html.twig');
    }

    #[Route('/download/collection/{iconsStyle}/{iconsList}', name: 'app_collection_download')]
    public function collectionDownload(IconsJson $iconsJson, $iconsStyle, $iconsList): Response
    {
        $downloadList = json_decode($iconsList, true);
        return $iconsJson->cssComplieur($downloadList, $iconsStyle);
    }

    #[Route("/icons/get/all", name: "app_get_icons_all", methods: "GET")]
    public function dataIcons(IconsJson $iconsJson): JsonResponse
    {
        $iconsJsonData = $iconsJson->downloadIconsJson();
        return $this->json($iconsJsonData);
    }
}
