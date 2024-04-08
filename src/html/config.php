<?php

return (object) array(
    'version' => '2.0',
    'database' => array(
        'type' => 'sqlite',
        'connectionString' => 'sqlite:../db/database.sqlite'
    ),
    'validation' => array(
        'maxRouteName' => 24,
        'maxAuthorName' => 24
    ),
    'generateName' => array(
        'nouns' => 'reference/nouns.txt',
        'adjectives' => 'reference/adjectives.txt',
        'names' => 'reference/names.txt',
        'weights' => array (
            'noun-noun' => 2,
            'noun-adjective' => 2,
            'name-noun' => 1,
            'adjective-name-noun' => 1,
            'adjective-noun' => 2 
        )
    ),
    'tasmota' => array(
        'commandPath' => 'http://192.168.20.198/cm',
        'colorMap' => 'grb'
    ),
    'frontend' => array(
        'wallLayout' => 'grid',
        'holdHeight' => 19,
        'holdWidth' => 12,
        'defaultAuthor' => 'Simon',
        'colorHand' => 'FF0066',
        'colorFoot' => '0000FF',
        'colorFinish' => 'FF0000',
        'colorStart' => '00FF00',
        'minGrade' => 0,
        'maxGrade' => 15
    )
);

?>