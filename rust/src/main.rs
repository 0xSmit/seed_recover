fn main() {
    let first_word: &str = "";
    let remaining_words: Vec<&str> = vec![];

    let words_without_first: Vec<&str> = remaining_words
        .into_iter()
        .filter(|&x| x != first_word)
        .collect();

    println!("{:?}", words_without_first);

    let permutations: Vec<Vec<&str>> = permute(words_without_first);

    println!("{:?}", permutations);
}

fn permute(words: Vec<&str>) -> Vec<Vec<&str>> {
    let mut result: Vec<Vec<&str>> = permute_helper(words, None);
    result
}

fn permute_helper<'a>(words: Vec<&'a str>, current: Option<Vec<&'a str>>) -> Vec<Vec<&'a str>> {
    let mut current2: Vec<&'a str> = current.unwrap_or(vec![]);
    let mut temp_result: Vec<Vec<&'a str>> = vec![];

    if words.len() == 0 {
        temp_result.push(current2.clone());
    } else {
    }

    temp_result
}
