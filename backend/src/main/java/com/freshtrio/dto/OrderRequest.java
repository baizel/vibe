package com.freshtrio.dto;

import lombok.Generated;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class OrderRequest {
    List<String> productIds;

}
